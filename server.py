from flask import Flask, render_template

class Server(object):

    def run(self):

        app = Flask(__name__)

        @app.route('/')
        def main_page():
            # load relevant flask model
            return render_template('index.html')

        app.run()

serv = Server()
serv.run()