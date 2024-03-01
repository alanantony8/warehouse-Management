import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bodyParser from 'body-parser';

import { getDevelopmentTime } from "./methods.js";


const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());
const Schema = mongoose.Schema;

const uri = 'mongodb+srv://alanTask:alanTask$8@atlascluster.swbbuhl.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster'
async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}

connect();

//schemas-----------------------------------------------
const employeeSchema = new Schema({
  name: { type: String, required: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

const wareHouseSchema = new Schema({
  model: { type: String, required: true },
  developmentTime: { type: Number, required: true },
  status: { type: String, enum: ['in-progress', 'paused', 'completed'], default: 'in-progress' },
  assignedTo: { type: String, default: null },
  startedAt: { type: Date, default: null },
  endTime: { type: Date, default: null }
});
//-------------------------------------------------------
const User = mongoose.model('employees', employeeSchema);
const BikeWarehouse = mongoose.model('BikeWarehouse', wareHouseSchema)

const users = [
  {
    name: "Alan",
    role: "employee",
    username: "alan",
    password: "alan@8"
  },
  {
    name: "admin",
    role: "admin",
    username: "admin",
    password: "admin"
  }
]

const createEmployees = async () => {
  const data = await User.insertMany(users);
}

const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("We need a token, please give it to us next time");
  } else {
    jwt.verify(token, "jwtSecret", (err, decoded) => {
      if (err) {
        console.log(err);
        res.json({ auth: false, message: "you are failed to authenticate" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

app.get('/create', async (req, res) => {
  await createEmployees();
})



app.post('/login', async (req, res) => {
  try {
    const { userName, password, selectedBike, role } = req.body;

    const pausedTask = await BikeWarehouse.findOne({
      assignedTo: userName,
      status: 'paused'
    });

    if (pausedTask) {
      res.status(400).json({
        status: 400,
        success: false,
        message: "You have a paused task. Please resume it before starting a new task.",
      });
      return;
    }

    const isUserExist = await User.findOne({
      userName
    });

    if (!isUserExist || (isUserExist?.role === 'admin' && selectedBike)) {
      res.status(404).json({
        status: 404,
        success: false,
        message: "User not found",
      });
      return;
    }

    const currentTime = new Date().getTime();

    if (isUserExist?.role === 'employee') {

      const newBike = await new BikeWarehouse({
        model: selectedBike,
        developmentTime: getDevelopmentTime(selectedBike),
        status: 'in-progress',
        assignedTo: userName,
        startedAt: new Date(currentTime),
        endTime: new Date(currentTime + getDevelopmentTime(selectedBike) * 60 * 1000)
      });

      await newBike.save()
    }

    const isPasswordMatched =
      isUserExist?.password === password;

    if (!isPasswordMatched) {
      res.status(400).json({
        status: 400,
        success: false,
        message: "wrong password",
      });
      return;
    }

    const token = jwt.sign(
      { _id: isUserExist?._id, userName: isUserExist?.userName },
      "YOUR_SECRET",
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      status: 200,
      success: true,
      message: "login success",
      token: token,
      userName,
      selectedBike,
      endTime: new Date(currentTime + getDevelopmentTime(selectedBike) * 60 * 1000)
    });
  } catch (error) {
    // Send the error message to the client
    res.status(400).json({
      status: 400,
      message: error.message.toString(),
    });
  }

});

app.post('/updateBikeStatus', async (req, res) => {
  try {
    const { username, bikeId } = req.body;

    await BikeWarehouse.updateOne(
      { assignedTo: username, model: bikeId, status: 'in-progress' },
      { status: 'completed', endTime: new Date() }
    );
    res.status(200).json({
      status: 200,
      success: true,
      message: 'Bike status updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      success: false,
      message: error.message.toString(),
    });
  }
});

app.post('/pauseBikeStatus', async (req, res) => {
  try {
    const { username, bikeId } = req.body;

    // Find the bike by assignedTo, model, and status 'in-progress'
    const bike = await BikeWarehouse.findOneAndUpdate(
      { assignedTo: username, model: bikeId, status: 'in-progress' },
      { status: 'paused', pausedTime: new Date() }, // Update status to 'paused' and store paused time
      { new: true }
    );
    console.log(bike);
    if (!bike) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Bike not found or already completed',
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: 'Bike status updated to paused successfully',
      pausedTime: bike.pausedTime,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      success: false,
      message: error.message.toString(),
    });
  }
});


app.get('/bikes-assembled', async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // const assembledBikes = await BikeWarehouse.countDocuments({
    //   status: 'completed',
    //   startedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }
    // });

    const assembledBikes = await BikeWarehouse.find({
      status: 'completed',
      startedAt: { $gte: fromDate, $lte: toDate },
    });

    console.log(assembledBikes, "assembledBikes");

    const employeeProduction = await BikeWarehouse.aggregate([
      {
        $match: {
          status: "completed"
        }
      },
      {
        $group: {
          _id: {
            assignedTo: "$assignedTo",
            startedAt: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$startedAt"
              }
            }
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          _id: 0,
          assignedTo: "$_id.assignedTo",
          date: "$_id.startedAt",
          count: 1
        }
      }
    ]);


    res.status(200).json({
      status: 200,
      message: 'Number of bikes assembled on selected date/time',
      data: {
        assembledBikes,
        employeeProduction,
        fromDate,
        toDate
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
});


app.get('/isUserAuth', verifyJWT, (req, res) => {
  res.send("You are authenticated Congrats:")
})

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});



app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});