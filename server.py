from bottle import Bottle, run, template

app = Bottle()

@app.route('/')
def hello():
    return "Hello World!"

run(app, host='localhost', port=3000)
