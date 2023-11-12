const isInt = /^[1-9]\d*$\b/g;
let userOrderDetails;
let numUsers;
let subtotal = total = 0;

function loadGroupSample() {
	const input = document.getElementById("billInput").value = `
david (You)
1	Super Burrito
$11.52
 	Choice of Meat
 	Pastor (Marinated Pork) ($0.00)
 	Choice of Beans
 	Black Beans ($0.00)
 	Tortilla Option
 	Flour (Recommended) ($0.00)
Claire
1	Super Quesadilla Suiza
$13.70
 	Choice of Meat
 	Asada (Steak) ($2.00)
 	Tortilla Option
 	Flour (Recommended) ($0.00)
Vince
1	Super Burrito
$11.52
 	Choice of Meat
 	Pastor (Marinated Pork) ($0.00)
 	Choice of Beans
 	Pinto Beans ($0.00)
 	Tortilla Option
 	Tomato ($0.00)
 
Subtotal	$36.74
Tax	$3.12
Service Fee 	$5.51
Delivery Fee 	$1.99
Delivery person tip	$7.10
`
}

function loadRegularSample() {
	const input = document.getElementById("billInput").value = `
1	Super Burrito
$11.52
 	Choice of Meat
 	Pastor (Marinated Pork) ($0.00)
 	Choice of Beans
 	Black Beans ($0.00)
 	Tortilla Option
 	Flour (Recommended) ($0.00)
1	Super Quesadilla Suiza
$13.70
 	Choice of Meat
 	Asada (Steak) ($2.00)
 	Tortilla Option
 	Flour (Recommended) ($0.00)
1	Super Burrito
$11.52
 	Choice of Meat
 	Pastor (Marinated Pork) ($0.00)
 	Choice of Beans
 	Pinto Beans ($0.00)
 	Tortilla Option
 	Tomato ($0.00)
 
Subtotal	$36.74
Tax	$3.12
Service Fee 	$5.51
Delivery Fee 	$1.99
Delivery person tip	$7.10
`
}

function reset() {
	subtotal = total = 0;
}

function priceToFloat(price) {
	const priceInFloat = parseFloat(price.replace("$", ""));
	if (isNaN(priceInFloat)) {
		console.error("invalid input");
		displayErrorMessage();
		return;	
	}
	return priceInFloat;
}

function distributeFees(value, isPercentage = false) {
	Object.values(userOrderDetails).forEach(userDetail => {
		const amountToAdd = isPercentage ? userDetail.total * value / subtotal : value / numUsers;
		;
		userDetail.fees += amountToAdd;
	});
}

function getEOLPrice(line) {
	return line.split(/(\s+)/).pop();
}

function createUserItemsContainer(details, user, shouldShowInputs = false) {
	const userItemsContainer = document.createElement("div");
	userItemsContainer.className = "userItemsContainer";
	Object.keys(details[user].items).forEach(item => {
		const itemContainer = document.createElement("div");
		itemContainer.className = shouldShowInputs ? "itemContainer assignmentMode" : "itemContainer";
		const quantity = details[user].items[item].quantity;
		const quantityLabel = (quantity > 1) ? " x" + quantity : "";
		const userItem = document.createTextNode(item + quantityLabel);
		itemContainer.appendChild(userItem);
		userItemsContainer.appendChild(itemContainer);
		if (shouldShowInputs) {
			const nameInput = document.createElement("input");
			nameInput.className = "nameInput";
			itemContainer.appendChild(nameInput);
			nameInput.setAttribute("data-itemname", item);
		}
	});
	return userItemsContainer;
}

function createFormattedResults(details) {
	const allUserResultsContainer = document.createElement("div");
	allUserResultsContainer.id = "allUserResultsContainer";

	Object.keys(details).forEach(user => {
		const userResultContainer = document.createElement("div");
		userResultContainer.className = "userResultContainer";

		const userNameContainer = document.createElement("div");
		userNameContainer.className = "userNameContainer";
		const userName = document.createTextNode(user);
		userNameContainer.appendChild(userName);
		userResultContainer.appendChild(userNameContainer);

		userResultContainer.appendChild(createUserItemsContainer(details, user));

		const userTotalContainer = document.createElement("div");
		userTotalContainer.className = "userTotalContainer";
		const userTotal = document.createTextNode("$" + details[user].total.toFixed(2));
		userTotalContainer.appendChild(userTotal);
		userResultContainer.appendChild(userTotalContainer);

		allUserResultsContainer.appendChild(userResultContainer);
	});

	return allUserResultsContainer;
}

function listItemsForAssignment(details) {
	const allUserResultsContainer = document.createElement("div");
	allUserResultsContainer.id = "allUserResultsContainer";

	const userResultContainer = document.createElement("div");
	userResultContainer.className = "userResultContainer";

	const assignTextContainer = document.createElement("div");
	assignTextContainer.id = "assignTextContainer";
	const assignText = document.createTextNode("Assign items to people:");
	assignTextContainer.appendChild(assignText);
	userResultContainer.appendChild(assignTextContainer);

	userResultContainer.appendChild(createUserItemsContainer(details, "TBD", true));

	const doneButtonContainer = document.createElement("div");
	doneButtonContainer.id = "doneButtonContainer";
	const doneButton = document.createElement("button");
	doneButton.innerHTML = "Done";
	doneButton.id = "doneButton";
	doneButton.onclick = function() {
		doneAssignment(details);
	}
	doneButtonContainer.appendChild(doneButton);
	userResultContainer.appendChild(doneButtonContainer);

	allUserResultsContainer.appendChild(userResultContainer);

	return allUserResultsContainer;
}

function doneAssignment(details) {
	const manualInputDetails = {};
	const nameInputs = document.getElementsByClassName("nameInput");
	const foundEmptyInput = Object.values(nameInputs).find(input => input.value == "");

	if (foundEmptyInput) {
		alert("All items must be assigned");
		return;
	}

	Object.values(nameInputs).forEach(input => {
		const name = input.value.toUpperCase();
		const itemName = input.dataset.itemname;
		const itemPrice = details["TBD"].items[itemName].price;
		if (!manualInputDetails.hasOwnProperty(name)) {
			// new user
			manualInputDetails[name] = {items: {}, total: itemPrice, fees: 0};
			manualInputDetails[name].items[itemName] = {price: itemPrice, quantity: 1};
		} else {
			// existing user
			if (!manualInputDetails[name].items.hasOwnProperty(itemName)) {
				// new item
				manualInputDetails[name].items[itemName] = {price: itemPrice, quantity: 1};
			} else {
				// existing item
				manualInputDetails[name].items[itemName] = manualInputDetails[name].items[itemName].quantity += 1;
			}
			manualInputDetails[name].total += itemPrice * manualInputDetails[name].items[itemName].quantity;
		}
	});

	splitBill(manualInputDetails);
}

function displayErrorMessage() {
	errorMessage = document.createElement("div");
	errorMessage.className = "errorMessage";
	errorMessage.appendChild(document.createTextNode("Input is invalid."));
	const splitResults = document.getElementById("splitResults");
	splitResults.innerHTML = "";
	splitResults.appendChild(errorMessage);
}

function splitBill(manualInputDetails = null) {
	reset();
	const details = manualInputDetails || {};
	const input = document.getElementById("billInput").value.trim();
	let tax = promotion = serviceFee = discount = offer = regulatory = deliveryFee = caDriver = deliveryDiscount = tip = 0;
	const lines = input.split('\n');
	let currentUser;
	let nextUser;
	let previousUser;

	for (let i = 0; i < lines.length; i++) {
		if (!manualInputDetails) {
			const itemQuantityLineSplit = lines[i].split('\t');
			const matchedInt = itemQuantityLineSplit.length > 0 && itemQuantityLineSplit[0].match(isInt);

			// found new order item
			if (matchedInt && matchedInt.length > 0) {			
				if (i == lines.length - 1) {
					console.error("invalid input");
					displayErrorMessage();
					return;
				}

				const itemQuantityLineIndex = i;
				const itemQuantity = parseInt(matchedInt[0]);

				if (itemQuantityLineIndex > 0) {
					if (nextUser) {
						// nextUser found on previous line
						currentUser = nextUser;
						nextUser = undefined;
					} else {
						const potentialUser = lines[itemQuantityLineIndex - 1];
						if (!((potentialUser.includes("$") && potentialUser.includes(".")) || /^\s/.test(potentialUser))) {
							// found new user
							const user = potentialUser.trim();
							currentUser = user;
						}
					}
				}

				if (!currentUser) {
					// no user, ask to assign users
					currentUser = "TBD";
				}

				if (currentUser !== previousUser) {
					details[currentUser] = {items: {}, total: 0, fees: 0};
				}
				previousUser = currentUser;

				// item quantity and name may be on the same line or on 2 consecutive lines
				// item name and price be on the same line or on 2 consecutive lines
				let itemName =  itemQuantityLineSplit.length > 1 ? itemQuantityLineSplit[1] : lines[itemQuantityLineIndex + 1];
				let itemPrice = itemQuantityLineSplit.length > 1 ? lines[itemQuantityLineIndex + 1] : lines[itemQuantityLineIndex + 2];

				if (!(itemPrice.startsWith("$"))) {
					const itemNameSplit = itemName.split("$");
					if (itemNameSplit.length > 1) {
						// lack of spacing between last item price and next user name
						itemName = itemNameSplit[0];
						itemPrice = itemNameSplit[1];
						if (itemPrice.includes(".") && isNaN(parseInt(itemPrice[itemPrice.length - 1]))) {
							// split after . and decimal places in item price
							const nextUserNameStartIndex = itemPrice.indexOf(".") + 3;
							nextUser = itemPrice.slice(nextUserNameStartIndex);
							itemPrice = itemPrice.slice(0, nextUserNameStartIndex);
						}
					} else {
						console.error("invalid input");
						displayErrorMessage();
						return;
					}
				}

				itemPrice = priceToFloat(itemPrice);
				// assign items to users
				if (itemQuantity > 1 && currentUser == "TBD") {
					// automatically split multi-quantity items for assignment mode in non-group orders
					for (let j = 0; j < itemQuantity; j++) {
						if (itemName in details[currentUser].items) {
							const itemNameCount = Object.keys(details[currentUser].items).filter(name => name.includes(itemName)).length;
							itemName = itemName + " " + (itemNameCount + 1);
						}
						details[currentUser].items[itemName] = {};
						details[currentUser].items[itemName].price = itemPrice;
						details[currentUser].items[itemName].quantity = 1;
						details[currentUser].total = details[currentUser].total + itemPrice;
					}
					continue;
				}

				if (itemName in details[currentUser].items) {
					const itemNameCount = Object.keys(details[currentUser].items).filter(name => name.includes(itemName)).length;
					itemName = itemName + " " + (itemNameCount + 1);
				}
				details[currentUser].items[itemName] = {};
				details[currentUser].items[itemName].price = itemPrice;
				details[currentUser].items[itemName].quantity = itemQuantity;
				details[currentUser].total = details[currentUser].total + itemPrice;
				continue;
			}
		}

		// confirm subtotal = sum of user totals
		const cleanedLine = lines[i].trim().toUpperCase().replace(/(\s+)/g, "");
		if (cleanedLine.startsWith("SUBTOTAL")) {
			subtotal = priceToFloat(getEOLPrice(lines[i]));
			const calculatedSubtotal = Object.values(details).reduce((total, userDetail) => userDetail.total + total, 0);

			if (Math.abs(subtotal - calculatedSubtotal) > 1) {
				console.error("invalid input");
				displayErrorMessage();
				return;
			}
		}

		// distribute order fees between users
		userOrderDetails = details;
		numUsers = Object.keys(details).length;
		if (cleanedLine.startsWith("TAX")) {
			tax = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(tax, true);
		} else if (cleanedLine.startsWith("PROMOTION")) {
			promotion = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(promotion);
		} else if (cleanedLine.startsWith("SERVICEFEE")) {
			serviceFee = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(serviceFee, true);
		} else if (cleanedLine.startsWith("CADRIVER")) {
			caDriver = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(caDriver);
		} else if (cleanedLine.startsWith("DISCOUNT")) {
			discount = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(discount);
		} else if (cleanedLine.includes("OFFER")) {
			offer = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(offer);
		} else if (cleanedLine.startsWith("REGULATORY")) {
			regulatory = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(regulatory);
		} else if (cleanedLine.startsWith("DELIVERYFEE")) {
			deliveryFee = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(deliveryFee);
		} else if (cleanedLine.startsWith("DELIVERYDISCOUNT")) {
			deliveryDiscount = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(deliveryDiscount);
		} else if (cleanedLine.startsWith("DELIVERYPERSONTIP") || cleanedLine.startsWith("TIP")) {
			tip = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(tip, true)
		} else if (cleanedLine.startsWith("TOTAL")) {
			total = priceToFloat(getEOLPrice(lines[i]));
		}
	};

	// update totals post fees
	Object.values(details).forEach(userDetail => {
		userDetail.total += userDetail.fees;
	});

	if (total == 0) {
		// if input did not list total, sum the subtotal, fees, discounts
		total = subtotal + tax + promotion + serviceFee + caDriver + discount + offer + regulatory + deliveryFee + deliveryDiscount + tip; 
	}

	const calculatedTotal = Object.values(details).reduce((total, userDetail) => userDetail.total + total, 0);

	if (Math.abs(total - calculatedTotal) > 1) {
		console.error("invalid input");
		displayErrorMessage();
		return;
	}

	const splitResults = document.getElementById("splitResults");
	splitResults.innerHTML = "";
	
	const results = currentUser === "TBD" ? listItemsForAssignment(details) : createFormattedResults(details);
	splitResults.appendChild(results);

	document.getElementById("splitResultsContainer").style.visibility = "visible";
}