from flask import Flask, render_template, request, jsonify

class Server(object):

    def run(self):

        app = Flask(__name__)

        @app.route('/')
        def main_page():
            # load relevant flask model
            return render_template('index.html')

        @app.route('/task1', methods=['POST'])
        def task1():
            r = request
            if request.form and request.form['q1'] and request.form['q2']:
                flag = 'g8i9KglmZR'

                q1 = request.form['q1']
                q2 = request.form['q2']

                q1_answers = ['00:00:0C:FD:B7:CA', '00000CFDB7CA']
                q2_answers = ['CISCO', 'CISCO SYSTEMS','CISCO SYSTEMS INC', 'CISCO SYSTEMS, INC']

                q1_true = False
                q2_true = False

                if q1.upper() in q1_answers:
                    q1_true = True
                if q2.upper() in q2_answers:
                    q2_true = True

                if q1_true and not q2_true:
                    message = "Question 1 correct, Question 2 incorrect. Try again!"
                if not q1_true and q2_true:
                    message = "Question 1 incorrect, Question 2 correct. Try again!"
                if not q1_true and not q2_true:
                    message = "Both questions incorrect. Try again!"
                if q1_true and q2_true:
                    message = "Correct! Have a flag! Flag is: " + flag
                return render_template('results.html', text=message)
            else:
                error_message = 'Error: please enter answers to all the qurstions!'
                return render_template('results.html', text=error_message)

        @app.route('/task2', methods=['POST'])
        def task2():
            message = ''
            try:
                r = request
                # check if Bob's PC has correct IP address etc
                pc = r.json['pc']
                laptop = r.json['laptop']
                if pc['ip'] != '192.168.0.99':
                    message = 'Incorrect IP Address for Bob\'s PC'
                elif pc['subnet_mask'] != '255.255.255.0':
                    message = 'Incorrect Subnet Mask for Bob\'s PC'
                elif pc['default_gateway'] != '192.168.0.1':
                    message = 'Incorrect default gateway for Bob\'s PC'
                elif pc['addressing_mode'] != 'static':
                    message = 'Incorrect status for Bob\'s PC'
                elif laptop['addressing_mode'] != 'dhcp':
                    message = 'Bob\'s laptop not configured via DHCP'
                else:
                    message = 'Congratulations! You passed! Have a flag: AhLEW6WuYm'

            except AttributeError as e:
                print(e)
                message = 'Incorrect configuration: make sure you have addresses configured for the PC and laptop and try again'
            finally:
                return jsonify({'message': message})



        app.run()

serv = Server()
serv.run()