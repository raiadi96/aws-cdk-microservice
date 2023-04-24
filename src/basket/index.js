exports.handler = async (event) => {
    // Your code here
    console.log(event);
    return {
        statusCode: 200,
        body: JSON.stringify({
        message:   `Hello from Basket Service, you just called ${event.path}`,
        }),
    };
}