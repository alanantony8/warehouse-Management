export const getDevelopmentTime = (selectedBike) => {
    switch (selectedBike) {
        case 1:
            return 50;
        case 2:
            return 60;
        case 3:
            return 80;
        default:
            return 0;
    }
}
