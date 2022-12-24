// processor.js
module.exports = function (job) {
// Do some heavy work
console.log('processor was called');
let result = {
    hello: 'world'
};
return Promise.resolve(result);
}