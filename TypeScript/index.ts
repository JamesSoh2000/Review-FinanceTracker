function calculation(income: number, taxyear = 2000): number {
    if (taxyear > 2000) {
        return income * 1.2;
    }
    return income * 1.3;
}

const payment = calculation(1000);
console.log(payment);




type User = {
    id : number,
    CreatedAt : Date,
    item: string
};

const user: User = {id : 1, CreatedAt : new Date(), item: 'toy'};

function UpdateUser(user: User, item: string): void {
    if (item) {
        user.item = item;
    }
}

UpdateUser(user, 'chicken')
console.log(user.id);