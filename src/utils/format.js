
const dateOptionsLong = {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short'
};

const dateOptionsCompact = {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
};

const dateOptionsDayOnly = {
    day: '2-digit'
};

const number0 = new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
const number2 = new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const dateLong = new Intl.DateTimeFormat(navigator.language, dateOptionsLong);
const dateShort = new Intl.DateTimeFormat(navigator.language, dateOptionsCompact);
const dayOnly = new Intl.DateTimeFormat(navigator.language, dateOptionsDayOnly)

const numberFormat = (value, precision) => {
    if (window) {
        if (window != null && window.Intl && value !== null && !isNaN(value)) {
            precision = precision !== undefined ? precision : 0;
            switch (precision) {
                case 0:
                    return number0.format(value);
                case 2:
                    return number2.format(value);
                default:
                    return new Intl.NumberFormat(navigator.language, { maximumFractionDigits: precision, minimumFractionDigits: precision }).format(value);

            }
        }
    }
    return value;
}

const dateShortFormat = value => {
    if (window && window.Intl && value && !isNaN(value))
        return dateShort.format(value);
    return value;
}

const dateLongFormat = value => {
    if (window && window.Intl && value && !isNaN(value))
        return dateLong.format(value);
    return value
}

const dateDayFormat = value => {
    if (window && window.Intl && value && !isNaN(value))
        return dayOnly.format(value);
    return value
}

export {
    numberFormat,
    dateShortFormat,
    dateLongFormat,
    dateDayFormat
}