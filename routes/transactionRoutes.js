const router = require("express").Router();
const Transaction = require("../db/transaction");
const Profile = require("../db/profile");
const { ObjectId } = require("mongodb");

router.post("/create", async (req, res) => {
  const transaction = req.body;
  try {
    let newTransferTransaction = null;
    let transferTransaction = { ...transaction };
    if (transaction.type === "transfer") {
      // Make modifications to the transferTransaction object
      transferTransaction.accountId = transaction.toAccountId;
      transferTransaction.fromAccountId = transaction.accountId;

      // Delete the toAccountId property from the transferTransaction object
      transferTransaction.toAccountId = "";

      newTransferTransaction = await Transaction.create(transferTransaction);
    }

    const newTransaction = await Transaction.create(transaction);

    console.log("New Transaction Created Successfully");
    newTransferTransaction
      ? res.status(201).json({
          message:
            "Transfer created successfully with ID: " + newTransaction._id,
          success: true,
          data: { from: newTransaction, to: newTransferTransaction },
        })
      : res.status(201).json({
          message:
            "Transaction created successfully with ID: " + newTransaction._id,
          success: true,
          data: newTransaction,
        });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/read/:userId", async (req, res) => {
  const userId = new ObjectId(req.params.userId);
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 25;

  try {
    if (!userId) {
      res
        .status(400)
        .json({ success: false, message: "Missing or wrong user ID" });
    }
    const totalCount = await Transaction.countDocuments({
      userId: userId,
      fromAccountId: "",
    });
    const totalPages = Math.ceil(totalCount / pageSize);

    const result = await Transaction.aggregate([
      { $match: { userId: userId, fromAccountId: "" } },
      { $sort: { date: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]);

    if (result.length > 0) {
      res.status(200).json({
        success: true,
        data: result,
        totalPages: totalPages,
        currentPage: page,
      });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error("Error reading documents:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.put("/update/:userId", async (req, res) => {
  const userId = req.params.userId;
  const transactionId = req.body._id;
  const data = req.body;

  try {
    const result = await Transaction.updateOne(
      { _id: new ObjectId(transactionId), userId: userId },
      { $set: data }
    );
    res.status(200).json({
      message: "Document updated successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/delete/:userId/:transactionId", async (req, res) => {
  const userId = req.params.userId;
  const transactionId = req.params.transactionId;

  try {
    const result = await Transaction.deleteMany({
      $or: [
        { _id: new ObjectId(transactionId) },
        { accountId: new ObjectId(transactionId) },
        { toAccount: new ObjectId(transactionId) },
        { fromAccount: new ObjectId(transactionId) },
      ],
    });
    // const result = await Transaction.deleteOne({ _id: new ObjectId(transactionId), userId: new ObjectId(userId) });
    if (result.deletedCount > 0) {
      res.status(200).json({
        message: "Transaction deleted successfully",
        success: true,
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Couldn't Find the Trasnaction",
        success: false,
        data: result,
      });
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
