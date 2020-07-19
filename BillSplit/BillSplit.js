let details = {};
let subtotal = total = 0;

function loadExample() {
	const input = document.getElementById("billInput").value = `
Claire (You)
1
Popcorn Chicken
$7.95
1
Boba Milk Tea
$4.75
 	Choice of Ice
 	25% (Little Ice) ($0.00)
 	Choice of Preparation
 	Black Tea ($0.00)
 	Choice of Sweetness
 	25% (Little Sweet) ($0.00)
Jill
1
Taro Milk Tea
$5.25
 	Choice of Ice
 	25% (Little Ice) ($0.00)
 	Choice of Toppings
 	Boba ($0.50)
 	Choice of Sweetness
 	25% (Little Sweet) ($0.00)
1
Popcorn Chicken
$7.95
Frederick
1
Mango Passion Fruit Tea
$5.75
 	Choice of Sweetness
 	50% (Half Sweet) ($0.00)
 	Choice of Ice
 	25% (Little Ice) ($0.00)
 	Choice of Toppings
 	Lychee Jelly ($0.50)
Vince Vince
1
Popcorn Chicken
$7.95
.
 
Subtotal	$39.60
Tax	$2.33
Promotion	-$5.94
Service Fee 	$5.94
Discount		-$1.98
Delivery Fee 	$3.99
Delivery Discount		-$3.99
Delivery person tip	$10.37
`
}

function reset() {
	details = {};
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
	const numUsers = Object.keys(details).length;
	
	Object.values(details).forEach(userDetail => {
		const amountToAdd = isPercentage ? userDetail.total * value / subtotal : value / numUsers;
		;
		userDetail.fees += amountToAdd;
	});
}

function getEOLPrice(line) {
	return line.split(/(\s+)/).pop();
}

function formattedResults() {
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

		const userItemsContainer = document.createElement("div");
		userItemsContainer.className = "userItemsContainer";
		details[user].items.forEach(item => {
			const itemContainer = document.createElement("p");
			itemContainer.className = "itemContainer";
			const userItem = document.createTextNode(item);
			itemContainer.appendChild(userItem);
			userItemsContainer.appendChild(itemContainer);
		});
		userResultContainer.appendChild(userItemsContainer);

		const userTotalContainer = document.createElement("div");
		userTotalContainer.className = "userTotalContainer";
		const userTotal = document.createTextNode("$" + details[user].total.toFixed(2));
		userTotalContainer.appendChild(userTotal);
		userResultContainer.appendChild(userTotalContainer);

		allUserResultsContainer.appendChild(userResultContainer);
	});

	return allUserResultsContainer;
}

function displayErrorMessage() {
	errorMessage = document.createElement("div");
	errorMessage.className = "errorMessage";
	errorMessage.appendChild(document.createTextNode("Input is invalid."));
	const splitResults = document.getElementById("splitResults");
	splitResults.innerHTML = "";
	splitResults.appendChild(errorMessage);
}

function splitBill() {
	reset();
	const input = document.getElementById("billInput").value.trim();
	let tax = promotion = serviceFee = discount = deliveryFee = deliveryDiscount = tip = 0;
	const lines = input.split('\n');
	let currentUser;

	for (let i = 0; i < lines.length; i++) {
		const isInt = /^[1-9]\d*$\b/g;
		const matchedInt = lines[i].match(isInt);
		
		if (matchedInt && matchedInt.length === 1) {
			// found new order item
			if (i == 0 || i == lines.length - 1) {
				console.error("invalid input");
				displayErrorMessage();
				return;
			}
			const itemLineIndex = i;
			const potentialUser = lines[itemLineIndex-1];
			
			if (!(potentialUser.startsWith("$") || /^\s/.test(potentialUser))) {
				// found new user
				const user = potentialUser.trim();
				currentUser = user;
				details[currentUser] = {items: [], total: 0, fees: 0};
			} else {
				if (!(currentUser)) {
					console.error("invalid input");
					displayErrorMessage();
					return;
				}
			}

			const itemName = lines[itemLineIndex+1];
			let itemPrice = lines[itemLineIndex+2];
			if (!(itemPrice.startsWith("$"))) {
				console.error("invalid input");
				displayErrorMessage();
				return;
			}
			itemPrice = priceToFloat(itemPrice);
			details[currentUser].items.push(itemName);
			details[currentUser].total = details[currentUser].total + itemPrice;
			continue;
		}

		const cleanedLine = lines[i].trim().toUpperCase().replace(/(\s+)/g, "");
		if (cleanedLine.startsWith("SUBTOTAL")) {
			subtotal = priceToFloat(getEOLPrice(lines[i]));
			const calculatedSubtotal = Object.values(details).reduce((total, userDetail) => userDetail.total + total, 0);
			if (subtotal != calculatedSubtotal) {
				console.error("invalid input");
				displayErrorMessage();
				return;
			}
		}

		if (cleanedLine.startsWith("TAX")) {
			tax = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(tax, true);
		} else if (cleanedLine.startsWith("PROMOTION")) {
			promotion = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(promotion);
		} else if (cleanedLine.startsWith("SERVICEFEE")) {
			serviceFee = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(serviceFee, true)
		} else if (cleanedLine.startsWith("DISCOUNT")) {
			discount = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(discount);
		} else if (cleanedLine.startsWith("DELIVERYFEE")) {
			deliveryFee = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(deliveryFee);
		} else if (cleanedLine.startsWith("DELIVERYDISCOUNT")) {
			deliveryDiscount = priceToFloat(getEOLPrice(lines[i]));
			distributeFees(deliveryDiscount);
		} else if (cleanedLine.startsWith("DELIVERYPERSONTIP")) {
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
		// input was missing total
		total = subtotal + tax + promotion + serviceFee + discount + deliveryFee + deliveryDiscount + tip; 
	}

	const calculatedTotal = Object.values(details).reduce((total, userDetail) => userDetail.total + total, 0);

	if (Math.abs(total - calculatedTotal) > 0.5) {
		console.error("invalid input");
		displayErrorMessage();
		return;
	}

	const splitResults = document.getElementById("splitResults");
	splitResults.innerHTML = "";
	splitResults.appendChild(formattedResults());
}