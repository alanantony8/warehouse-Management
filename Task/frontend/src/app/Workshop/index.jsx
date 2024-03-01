import React, { useState } from "react";
import { Button, Card, message } from "antd";
import Countdown from "react-countdown";
import { getImageForBikeId } from "../Login/constants";
import { callApi } from "../apiUtils";

const Workshop = () => {
  const [completionMessage, setCompletionMessage] = useState("");

  const endTime = new Date(localStorage.getItem("endTime"));

  const userName = localStorage.getItem("userName");
  const bikeId = localStorage.getItem("bikeId");

  const onComplete = () => {
    const updateBikeStatus = async () => {
      try {
        const response = await callApi("/updateBikeStatus", "POST", {
          username: userName,
          bikeId: bikeId,
        });

        if (response.ok) {
          console.log("Bike status updated successfully");
        } else {
          console.error("Failed to update bike status");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    updateBikeStatus();
    setCompletionMessage("Work completed successfully!");
  };

  const handleRetry = () => {
    setCompletionMessage("Work not yet completed.");
  };

  const handlePause = async () => {
    try {
      const response = await callApi("/pauseBikeStatus", "POST", {
        username: userName,
        bikeId: bikeId,
      });

      if (response.ok) {
        message.success("Bike status updated to paused successfully");
      } else {
        message.error("Failed to update bike status to paused");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to update bike status to paused");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", paddingTop: "100px" }}>
      <Card
        title="Workshop Confirmation"
        style={{ width: 400, margin: "auto", marginTop: 16 }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={getImageForBikeId(bikeId)}
            alt="Scooter"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
        <p>Employee Name: {userName}</p>
        <p>Bike Model: {bikeId}</p>
        <div>
          <Button onClick={handlePause}>Pause</Button>
        </div>
        <Countdown date={endTime}>
          {
            <>
              {" "}
              <p>Have you completed your work?</p>
              {completionMessage ? (
                <p>{completionMessage}</p>
              ) : (
                <>
                  <Button type="primary" onClick={onComplete}>
                    Yes, work is completed
                  </Button>
                  <Button onClick={handleRetry}>No</Button>
                </>
              )}
            </>
          }
        </Countdown>
      </Card>
    </div>
  );
};

export default Workshop;
