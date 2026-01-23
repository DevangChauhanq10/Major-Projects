
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const fixIndexes = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    // Access the raw collection
    const collection = mongoose.connection.collection("users");
    
    // List indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map(i => i.name));

    // Drop the problematic index
    if (indexes.find(i => i.name === 'emails_1')) {
        console.log("Found obsolete index 'emails_1'. Dropping it...");
        await collection.dropIndex("emails_1");
        console.log("✅ Successfully dropped index: emails_1");
    } else {
        console.log("ℹ️ Index 'emails_1' not found. It might have been already dropped.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing indexes:", error);
    process.exit(1);
  }
};

fixIndexes();
