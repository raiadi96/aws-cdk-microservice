exports.handler = async (event) => {
    console.log("Received Request", JSON.stringify(event, null, 2));
    try
    {
        return {
            statusCode: 200,
            body: "Hello from ordering service. You've hit " + event.path + " endpoint"
        }
    }
    catch(err)
    {
        console.log("Error occured in ordering service", err);
        throw err;
    }
};