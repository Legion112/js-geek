let yummyThings = ['pizza', 'gelato', 'sushi', 'cheeseburger'];

let greatThings = ['swimming', 'sunsets', ...yummyThings, 'New Orleans'];
let copyOfGreatThings = [...greatThings];

copyOfGreatThings.push('summer');

console.log(copyOfGreatThings);
console.log(greatThings);