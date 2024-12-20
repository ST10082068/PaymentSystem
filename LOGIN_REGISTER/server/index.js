const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const ExpressBrute = require('express-brute');
const xss = require('xss');
const cors = require('cors');
const dotenv = require('dotenv');
const forceSsl = require('express-force-ssl');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const https = require('https');
const path = require('path');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const router = express.Router();

dotenv.config();
const UserModel = require('./models/User');
const Transaction= require('./models/Transaction'); // Import your Transaction model
const EmployeeModel = require('./models/Employee');
const JWT_SECRET = process.env.JWT_SECRET;

const app = express()
app.use(helmet());
app.use(forceSsl);
app.use(express.json())
app.use(forceSsl);
app.use(cors({
    origin: "https://localhost:5173", // The URL of your Vite app
    methods: ["GET", "POST"],
    credentials: true // If you need to handle cookies/auth tokens
}));
app.use(bodyParser.json({ limit: '10kb' }));

// Input Whitelisting Function
const sanitizeInput = (input) => {
    return xss(input.trim());
};

const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store, {
    freeRetries: 100,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 10 * 60 * 1000, // 10 minutes
    failCallback: (req, res) => res.status(429).json({ message: 'Too many requests, try again later.' }),
});
app.use(bruteforce.prevent);

// Rate limiting middleware to avoid DDOS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

if (process.env.NODE_ENV === 'production') {
    app.use(forceSsl);  // Force SSL in production
  }

//mongoose.connect("mongodb+srv://st10082068:yFTZOzGaZTsRaq7r@cluster0.70zzob1.mongodb.net/");
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('MongoDB connection error', err);
        process.exit(1); // Exit process with failure
    });

    app.get('/customerDashboard', auth, (req, res) => {
        res.status(200).json({message: "Welcome"})
    });

    app.get('/payment-process', auth, (req, res) => {
        res.render('payment-process');  
    });

    // Route to fetch payment receipts for a specific user
app.get('/payment-receipts/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const receipts = await Transaction.find({ userId }).sort({ date: -1 }).limit(2); // Get the last 2 transactions
        res.json(receipts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const generateAccountNumber = () => {
    // Generate a random 10-digit account number (or any format you prefer)
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

app.post('/register', async (req, res) => {
    const { name, surname, email, password, confirmPassword, id } = req.body;

    // Check if passwords match
    /*if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match!" });
    }*/
    try {
        // Check if the user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }
        /*const idExists = await UserModel.find({id});
        if (idExists) {
            return res.status(400).json({ message: "User already exists!" });
        }*/

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a unique account number
        let accountNumber;
        let accountNumberExists = true;

        // Ensure the generated account number is unique
        while (accountNumberExists) {
            accountNumber = generateAccountNumber();
            const existingAccount = await UserModel.findOne({ accountNumber });
            accountNumberExists = !!existingAccount;
        }

        // Create and save the user
        const user = new UserModel({
            name,
            surname,
            email,
            password: hashedPassword,
            id,
            accountNumber
        });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign({ userId: user._id , name: user.name}, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
                return res.json({ message: "SUCCESS", token }); // Send the token in the response
            } else {
                return res.status(400).json("Incorrect password");
            }
        } else {
            return res.status(400).json("User does not exist");
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

//Employee login logic
app.post('/employeeLogin', async (req, res) => {
    //console.log("Got Here");
    const { username, password } = req.body;
    try {

        const employee = await EmployeeModel.findOne({ username });
        if (employee) {
            const isMatch = await bcrypt.compare(password, employee.password);
            if (isMatch) {
                const token = jwt.sign({ employeeId: employee._id, emlpoyeeName: employee.name }, 
                // Token expires in 1 hour
                JWT_SECRET, { expiresIn: '1h' }); 
                // Send the token in the response
                return res.json({ message: "SUCCESS", token });
            } else 
            {
                return res.status(400).json("Incorrect password");
            }

        } else {
            return res.status(400).json("Employee does not exist");
        }
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/employeeLogin', (req, res) => {
    res.render('employeeLogin');  
});

app.get('/home', auth, (req, res) => {
    res.status(200).json({message: "Welcome"})
});

// Transaction Schema for MongoDB
const transactionSchema = new mongoose.Schema({
    //fromAccountNumber: { type: String, required: true },
    recipientAccountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    //currency: { type: String, required: true },
    //provider: { type: String, required: true },
    date: { type: Date, default: Date.now },
    recipientName: { type: String, required: true },
    recipientBank: { type: String, required: true },
    swiftCode: { type: String, required: true },
    status:{type: String, required: true, default: 'pending'}
});


const authToken = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // Replace 'your_jwt_secret' with your actual secret
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
// Route to fetch pending transactions
app.get('/transactions/pending', auth, async (req, res) => {
    try {
        const pendingTransactions = await Transaction.find({ status: 'Pending' });
        res.json(pendingTransactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to fetch verified transactions
app.get('/transactions/verified', auth, async (req, res) => {
    try {
        const verifiedTransactions = await Transaction.find({ status: 'Verified' });
        res.json(verifiedTransactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Process Payment and store it in MongoDB
app.post('/payment-process', authToken, async (req, res) => {
    console.log("Got Here");
    const { recipientAccountNumber, amount, recipientName, recipientBank,  swiftCode, status} = req.body;
    console.log(req.body);  // Before the axios request to ensure status is there
    try {
       // Use the userId from the token to find the user
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Create a new transaction
        const transaction = new Transaction({
            userId: user._id, // Reference the user by their ID
            recipientAccountNumber,
            amount,
            date: new Date(), // Add the date of the transaction
            recipientName,
            recipientBank,
            swiftCode,
            status: 'pending'
        });
        


        // Save the transaction in MongoDB
        await transaction.save();
        res.status(200).json({ message: "Payment processed successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get the last 2 payments made by the user
app.get("/payment-receipts/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log("Got Here "+userId);
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Retrieve the last 2 transactions
        const lastTwoTransactions = await Transaction.find({ userId: user._id }).sort({ date: -1 }).limit(2);
        res.status(200).json(lastTwoTransactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get pending transactions
app.get('/employeeDashboard', auth, async (req, res) => {
    //console.log("Got here Employee")
    try {
        const pendingTransactions = await Transaction.find({ status: 'pending' });
        res.json(pendingTransactions);
    } catch (error) {   
        res.status(500).json({ message: error.message });
    }
});

//-------------------------------------------------------------------------------------------------------------//

// To verify or reject a transaction 
app.post(`/transactionVerification/:transactionId`, authToken, async (req, res) => {
    const { transactionId } = req.params;
    const { status } = req.body; // Should be either "verified" or "rejected"

    console.log(`Verifying transaction ${transactionId} with status ${status}...`);

    if (status !== 'verified' && status !== 'rejected') {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ message: "Transaction is already verified or rejected" });
        }

        // Update the transaction status
        transaction.status = status;
        transaction.verifiedDate = new Date();
        await transaction.save();

        console.log(`Transaction ${transactionId} ${status} successfully!`);
        res.status(200).json({ message: `Transaction ${status} successfully!` });
    } catch (error) {
        console.error(`Error verifying transaction ${transactionId}:`, error);
        res.status(500).json({ message: error.message });
    }
});

// Route to fetch a specific transaction (for review purposes)
app.get('/transactionVerification/:transactionId', authToken, async (req, res) => {
    const { transactionId } = req.params;

    console.log(`Fetching transaction ${transactionId}...`);

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json(transaction);
    } catch (error) {
        console.error(`Error fetching transaction ${transactionId}:`, error);
        res.status(500).json({ message: error.message });
    }
});

//-------------------------------------------------------------------------------------------------------------//
//Gets all transactions
app.get('/allTransactions', authToken, async (req, res) => {

    try{
        const transactions = await Transaction.find();
        res.json(transactions);
        console.log(`Fetching all transactions`);
    }catch(error){
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});


// SSL & Error Handling Middleware
app.use((req, res, next) => {
    if (!req.secure && process.env.NODE_ENV !== 'development') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

    const key= fs.readFileSync('./keys/privatekey.pem');
    const cert= fs.readFileSync('./keys/certificate.pem');

  // Start the HTTPS server
https.createServer({key,cert}, app).listen(3000, () => {
    console.log("HTTPS server is running on port 3000");
  });

  
/*app.listen(3000, () => {
    console.log("server is running!")
});*/