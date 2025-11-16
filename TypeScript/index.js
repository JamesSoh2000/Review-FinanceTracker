function calculation(income, taxyear) {
    if (taxyear === void 0) { taxyear = 2000; }
    if (taxyear > 2000) {
        return income * 1.2;
    }
    return income * 1.3;
}
var payment = calculation(1000);
console.log(payment);
