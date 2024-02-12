process.stdin.setEncoding("utf8");
const http = require("http");
const path = require("path");
const express = require("express");
const app = express();
const portNumber = 5000;
const bodyParser = require("body-parser");
const fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.resolve(__dirname, "templates"));
if (process.argv.length != 3) {
  process.stdout.write(`Usage superMarketServer.js jsonFile`);
  process.exit(1);
}

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

class Shop {
    #items;
    #costs;

    constructor() {
        this.#items = [];
        this.#costs = [];
    }

    get items() {
        return this.#items;
    }

    get costs() {
        return this.#costs;
    }

    addItem(itemName) {
        this.#items.push(itemName);
    }

    addCost(itemCost) {
        this.#costs.push(itemCost);
    }
}

const currShop = new Shop();
app.set("view engine", "ejs");
app.get("/", (request, response) => {
    response.render("index");
});

var parsedData;
if (process.argv[2] === 'itemsList.json') {
    filePath = 'itemsList.json';
} else {
    filePath = 'itemsListTwo.json';
}
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Parse the JSON data
  parsedData = JSON.parse(data);
});

app.get("/catalog", (request, response) => {
    const table = {
    itemsTable:  `
        <table border='1'>
        <thead>
            <tr>
            <th>Item</th>
            <th>Cost</th>
            </tr>
        </thead>
        <tbody>
            ${parsedData.itemsList.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.cost}</td>
            </tr>
            `).join('')}
        </tbody>
        </table>
        `
    };
    response.render("displayItems", table);
});
  
app.get("/order", (request, response) => {
    let itemsHTML = '';
    parsedData.itemsList.forEach(item => {
        itemsHTML += `<option border=1 value="${item.name}">${item.name}</option>`;
    });
    const selectionBox = {
        items: itemsHTML
    };
    response.render("placeOrder", selectionBox);
});
var total = 0;
var selectedItem; 
app.post("/order", (request, response) => {
    let {name, email, delivery, itemsSelected} = request.body;
    if (Array.isArray(itemsSelected)) {
        itemsSelected.forEach(itemName => {
            if (curr = parsedData.itemsList.find(item => item.name === itemName)) {
                total += curr.cost;
            }
        });
        response.render("orderConfirmation", { name, email, delivery, 
            orderTable: `
            <table border='1'>
            <thead>
                <tr>
                <th>Item</th>
                <th>Cost</th>
                </tr>
            </thead>
            <tbody>

            ${itemsSelected.map(itemName => {
                selectedItem = parsedData.itemsList.find(item => item.name === itemName);
                if (selectedItem) {
                return `
                    <tr>
                    <td>${selectedItem.name}</td>
                    <td>${selectedItem.cost}</td>
                    </tr>
                `;
                } else {
                return '';
                }
            }).join('')}
                <tr>
                    <td>Total Cost</td>
                    <td>${total.toFixed(2)}</td>
                </tr>
            </tbody>
            </table>
            `
        });
        total = 0;
    } else {
        curr = parsedData.itemsList.find(item => item.name === itemsSelected)
        if (curr) {
            total += curr.cost;
        }
       
        response.render("orderConfirmation", { name, email, delivery, 
            orderTable: `
            <table border='1'>
            <thead>
                <tr>
                <th>Item</th>
                <th>Cost</th>
                </tr>
            </thead>
            <tbody>
            <tr>
                <td>${curr.name}</td>
                <td>${curr.cost}</td>
            </tr>
            
            <tr>
                <td>Total Cost</td>
                <td>${total.toFixed(2)}</td>
            </tr>
            </tbody>
            </table>
            `
        });
        total = 0; 
    }
});

const prompt = "Type itemsList or stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function() {
    let input = process.stdin.read();
    if (input !== null) {
        let command = input.trim();
        if (command === "itemsList") {
            if (process.argv[2] === "itemsList.json") {
                const jsonFileContent = fs.readFileSync("itemsList.json", "utf8");
                console.log(jsonFileContent);
            } else {
                const jsonFileContent = fs.readFileSync("itemsListTwo.json", "utf8");
                console.log(jsonFileContent);
            }
        } else if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        } else {
            process.stdout.write(`Invalid command: ${command}\n`);
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});



