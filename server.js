const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Load the protobuf file
const packageDef = protoLoader.loadSync("todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;

// Define an array to store todos
const todos = [];

// Define the createTodo method
function createTodo(call, callback) {
    const todoItem = {
        id: todos.length + 1,
        text: call.request.text
    };
    todos.push(todoItem);
    callback(null, todoItem);
}

// Define the readTodos method
function readTodos(call, callback) {
    callback(null, { items: todos });
}

// Define the readTodosStream method
function readTodosStream(call, callback) {
    todos.forEach(todo => call.write(todo));
    call.end();
}

// Create a new gRPC server
const server = new grpc.Server();

// Add the Todo service and its methods to the server
server.addService(todoPackage.Todo.service, {
    createTodo: createTodo,
    readTodos: readTodos,
    readTodosStream: readTodosStream
});

// Bind the server to the specified address and port
server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Server running at http://0.0.0.0:${port}`);
});
