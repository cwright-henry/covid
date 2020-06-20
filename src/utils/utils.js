const colors = [
    "#2196F3",
    "#FFF59D",
    "#3949AB",
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
    "#FFFFFF",
    "#ff0000"
];

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 * 
 * @param {*} object 
 */
export const deepFreeze = (object) => {

    // Retrieve the property names defined on object
    var propNames = Object.getOwnPropertyNames(object);

    // Freeze properties before freezing self

    for (let name of propNames) {
        let value = object[name];

        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }

    return Object.freeze(object);
}

export const findColor = index => {
    return colors[index % colors.length];
};

/**
 * Unique ID from element
 */
export const uuid = () => {
    return parseInt(Math.random().toString().slice(2, 11))
}

/**
 * https://css-tricks.com/snippets/javascript/lighten-darken-color/
 * 
 * @param {*} col 
 * @param {*} amt 
 */
export const lightenDarkenColor = (col, amt) => {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

}

