const colors = [
    "#2196F3",
    "#FFF59D",
    "#3f51b5",
    "#E64A19",
    "#ffc107",
    "#009688",
    "#8bc34a",
    "#cddc39",
    "#4caf50",
    "#00bcd4",
    "#2196f3",
    "#673ab7",
    "#e91e63",
    "#ffeb3b",
    "#ff5722",
    "#607d8b",
    "#000000",
    "#ff0000"
];

export const findColor = index => {
    return colors[index % colors.length];
};

/**
 * Unique ID from element
 */
export const uuid = () => {
    return parseInt(Math.random().toString().slice(2, 11))
}