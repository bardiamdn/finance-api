const defaultAccounts = [
    { accountTitle: "💵 Cash", accountColor: "#FFD700", accountBalance: 0 }, 
    { accountTitle: "🏦 Bank Account", accountColor: "#3E8E41", accountBalance: 0 }, 
    { accountTitle: "💳 Credit Card", accountColor: "#FF4500", accountBalance: 0 }, 
    { accountTitle: "💰 Savings", accountColor: "#2E86C1", accountBalance: 0 }, 
    { accountTitle: "📈 Investment", accountColor: "#6A1B9A", accountBalance: 0 }, 
];

const defaultCategories = [
    { categoryTitle: "💼 Salary", categoryType: "income", categoryColor: "#4CAF50" }, // Green for wealth
    { categoryTitle: "🏢 Business", categoryType: "income", categoryColor: "#81C784" }, // Light green for commerce
    { categoryTitle: "📊 Investments", categoryType: "income", categoryColor: "#FFD54F" }, // Yellow for returns
    { categoryTitle: "🎁 Other Income", categoryType: "income", categoryColor: "#FFEE58" },
    { categoryTitle: "🍔 Food", categoryType: "expense", categoryColor: "#FF7043" }, // Orange-red for meals
    { categoryTitle: "🏠 Rent", categoryType: "expense", categoryColor: "#BDBDBD" }, // Gray for housing
    { categoryTitle: "🚗 Transportation", categoryType: "expense", categoryColor: "#546E7A" }, // Blue-gray for vehicles
    { categoryTitle: "💡 Utilities", categoryType: "expense", categoryColor: "#8D6E63" }, // Brown for resources
    { categoryTitle: "🎮 Entertainment", categoryType: "expense", categoryColor: "#03A9F4" }, // Bright blue for fun
    { categoryTitle: "❤️ Healthcare", categoryType: "expense", categoryColor: "#E91E63" }, // Red for health
    { categoryTitle: "🛡️ Insurance", categoryType: "expense", categoryColor: "#00796B" }, // Teal for security
    { categoryTitle: "🎓 Education", categoryType: "expense", categoryColor: "#3F51B5" }, // Indigo for learning
    { categoryTitle: "📦 Other Expenses", categoryType: "expense", categoryColor: "#FF9800" }, // Bright orange for miscellaneous

];


function getRandomDate(startDate, endDate) {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime()) || 
        !(endDate instanceof Date) || isNaN(endDate.getTime())) {
        throw new Error("Invalid startDate or endDate");
    }

    const randomTimestamp = Math.floor(Math.random() * (endDate - startDate + 1)) + startDate.getTime();
    const randomDate = new Date(randomTimestamp);

    if (isNaN(randomDate.getTime())) {
        throw new Error("Generated random date is invalid");
    }

    return randomDate;
}

async function getRandomTransactions(profile, number, mostIncome, daysBefore, incomeExpenseWeight) {
    let weight
    if(!incomeExpenseWeight) {
        weight = 0.5
    } else {
        weight = incomeExpenseWeight
    }
    const transactions = [];
    const endDate = new Date(); 
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - daysBefore); 

    for (let i = 0; i < number; i++) {
        const category = profile.categories[Math.floor(Math.random() * profile.categories.length)]
        const account = profile.accounts[Math.floor(Math.random() * profile.accounts.length)]
        let amount = category.categoryType === "income" 
            ? Math.floor(Math.random() * mostIncome) + 1 
            : Math.min(account.accountBalance, Math.floor(Math.random() * mostIncome * weight) + 1);
        const newAccountBalance = category.categoryType === "income" ? account.accountBalance + amount : account.accountBalance - amount

        const randomTransaction = {
            userId: profile._id,
            accountId: account._id,
            toAccountId: "",
            fromAccountId: "",
            categoryId: category._id,
            amount: amount,
            date: getRandomDate(startDate, endDate), 
            type: category.categoryType,
            description: `Random transaction ${i + 1}`,
            submitDateTime: new Date(),
        };
        if(randomTransaction.amount !== 0) {
            transactions.push(randomTransaction);
            
            const accountToUpdate = profile.accounts.id(randomTransaction.accountId);
            if (accountToUpdate) {
                accountToUpdate.accountBalance = newAccountBalance;
            }
        };
    }
    try {
        await profile.save()
    } catch(error) {
        console.error("Couldn't save the updated profile", error)
    }

    return transactions;
}



module.exports = {
    defaultAccounts,
    defaultCategories,
    getRandomDate,
    getRandomTransactions
};