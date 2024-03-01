import scooter from "../../assets/images/scooter.webp";
import futuristic from "../../assets/images/futuristic.webp";
import superBike from "../../assets/images/superBike.webp";

export const bikes = [
    { id: 1, name: 'Bike 1', image: scooter },
    { id: 2, name: 'Bike 2', image: superBike },
    { id: 3, name: 'Bike 3', image: futuristic },
];

export const getImageForBikeId = (bikeId) => {
    const bike = bikes.find(b => b.id === JSON.parse(bikeId));
    return bike ? bike.image : null;
};