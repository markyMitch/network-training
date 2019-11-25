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
                q2_answers = ['CISCO', 'CISCO SYSTEMS', 'CISCO SYSTEMS INC', 'CISCO SYSTEMS, INC']

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

        @app.route('/task3', methods=['POST'])
        def task3():
            message = ''
            # check employee pc
            try:
                r = request
                employee_pc = r.json['employee_pc']
                employee_router = r.json['employee_router']
                finance_pc = r.json['finance_pc']
                finance_router = r.json['finance_router']

                employee_ip = employee_pc['ip']
                employee_ip_parts = employee_ip.split('.')
                if (len(employee_ip_parts) != 4 or employee_ip_parts[0] != '192' or employee_ip_parts[1] != '168'
                        or employee_ip_parts[2] != '0'):
                    message = 'Incorrect IP for Employee PC'
                    raise ValueError
                employee_ip_segment = int(employee_ip_parts[3])
                if(employee_ip_segment < 0 or employee_ip_segment > 255 or employee_ip_segment == 1):
                    message = 'Incorrect IP for Employee PC'
                    raise ValueError
                if employee_pc['subnet_mask'] != '255.255.255.0':
                    message = 'Incorrect subnet mask for Employee PC'
                    raise ValueError
                if employee_pc['default_gateway'] != '192.168.0.1':
                    message = 'Incorrect default gateway for Employee PC'
                    raise ValueError

                finance_ip = finance_pc['ip']
                finance_ip_parts = finance_ip.split('.')
                if (len(finance_ip_parts) != 4 or finance_ip_parts[0] != '192' or finance_ip_parts[1] != '168'
                        or finance_ip_parts[2] != '1'):
                    message = 'Incorrect IP for Finance PC'
                    raise ValueError
                finance_ip_segment = int(finance_ip_parts[3])
                if (finance_ip_segment < 0 or finance_ip_segment > 127 or finance_ip_segment == 1):
                    message = 'Incorrect IP for Finance PC'
                    raise ValueError
                if finance_pc['subnet_mask'] != '255.255.255.128':
                    message = 'Incorrect subnet mask for Finance PC'
                    raise ValueError
                if finance_pc['default_gateway'] != '192.168.1.1':
                    message = 'Incorrect default gateway for Finance PC'
                    raise ValueError

                if not('Employee PC' in employee_router['names']):
                    message = 'Error: you have not connected up the network as instructed'
                    raise ValueError
                if not('Finance PC' in finance_router['names']):
                    message = 'Error: you have not connected up the network as instructed'
                    raise ValueError
                if not ('Finance Router' in employee_router['names']):
                    message = 'Error: you have not connected up the network as instructed'
                    raise ValueError
                message = 'Congratulations! You passed! Have a flag: XMix8ZZGpX'
            except AttributeError as e:
                print(e)
                message = 'Incorrect configuration: make sure you have the network configured try again'
            except ValueError:
                pass
            finally:
                return jsonify({'message': message})

        @app.route('/task4', methods=['POST'])
        def task4():
            message = ''

            try:
                r = request
                pc = r.json['pc']
                router = r.json['router']
                firewall = r.json['firewall']

                if not('Management PC' in router['names']):
                    message = 'Error: Network configured incorrectly'
                    raise ValueError
                if not('Firewall' in router['names']):
                    message = 'Error: Network configured incorrectly'
                    raise ValueError
                if not('Internet' in firewall['names']):
                    message = 'Error: Network configured incorrectly'
                    raise ValueError
                if pc['addressing_mode'] != 'dhcp':
                    message = 'Error: Management PC not configured by DHCP'
                    raise ValueError

                # check firewall ports
                correct_ports = [22, 53, 80, 123, 443]

                ports = firewall['whitelist']
                port = ports.sort()

                if len(ports) != len(correct_ports):
                    message = 'Error: Wrong number of ports on firewall whitelist'
                    raise ValueError

                if ports != correct_ports:
                    message = 'Error: Incorrect ports for firewall whitelist'
                    raise ValueError
                message = 'Congratulations! You passed! Have a flag: vCJ0BHCsI4'

            except AttributeError as e:
                print(e)
                message = 'Incorrect configuration: make sure you have the network configured try again'
            except ValueError:
                pass
            finally:
                return jsonify({'message': message})

        app.run()


serv = Server()
serv.run()
