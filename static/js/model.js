class NetworkNode {
    ip = null;
    MAC = null;
    image = null;
    subnet_mask = null;
    default_gateway = null;
    neighbour = null;
    addressing_mode = null;
    log = "";

    constructor(name, MAC) {
        this.name = name;
        this.MAC = MAC;
    }

    ipconfig() {
    	var startline = 'Windows IP Configuration\n\n';
    	var adapterline = 'Ethernet Adapter Ethernet:\n\n';
    	var MACline = 'Physical Address...........' + this.MAC + '\n';
    	var ipline = '';
    	var subnetline = '';
    	var gatewayline = '';

    	if(this.ip == null) {
    		ipline = 'IPv4 Address.................Not specified\n';
    	} else {
    		ipline = 'IPv4 Address.................' + this.ip + '\n';
    	}

    	if(this.subnet_mask == null) {
    		subnetline = 'Subnet Mask..................Not specified\n';
    	} else {
    		subnetline = 'Subnet Mask..................' + this.subnet_mask + '\n';
    	}

    	if(this.default_gateway == null) {
    		gatewayline = 'Default gateway..............Not specified\n';
    	} else {
    		gatewayline = 'Default gateway..............' + this.default_gateway + '\n';
    	}

    	return startline + adapterline + MACline + ipline + subnetline + gatewayline;
    	
    }


    renew_dhcp() {
    	if(this.neighbour) {
    		this.write_info('Sending DHCP Request over network');
    		this.load_log();
    		this.neighbour.handle_message('renew_dhcp', this.MAC, '', null); //not getting sent to router
    	} else {
    		this.write_info('Error: need to be connected to a network to send DHCP request');
    		this.load_log();
    	}
    }

    static_ip(ip,subnet_mask, default_gateway) {
    	//check ip
    	if(!this.check_ip(ip)) {
    		this.write_info('Error: invalid ip');
    		this.load_log();
    		return;
    	}
    	if(!this.check_ip(subnet_mask)) {
    		this.write_info('Error: invalid subnet mask');
    		this.load_log();
    		return;
    	}
    	if(!this.check_ip(default_gateway)) {
    		this.write_info('Error: invalid defaut gateway');
    		this.load_log();
    		return;
    	}
    	this.ip = ip;
    	this.subnet_mask = subnet_mask;
    	this.default_gateway = default_gateway;
    	this.addressing_mode = 'static';
    	this.write_info('Static IP updated');
    	this.load_log();
    }

    check_ip(ip) {
    	let parts = ip.split('.');
    	if(parts.length != 4) {
    		return false;
    	}
    	for(let i = 0; i < parts.length; i++) {
    		let part_int = parseInt(parts[i]);
    		if(part_int == NaN || part_int < 0 || part_int > 255) {
    			return false;
    		}
    	}
    	return true;
    }

    connect(node) {
    	if(this.neighbour) {
    		if(this.neighbour == node) {
    			//already connected
    			this.write_info("Error: already connected to " + node.name);
    		} else {
    			//connected to something else
    			this.write_info("Error: all connections full");
    		}
    	} else {
    		this.neighbour = node;
    		this.write_info("Connected to " + node.name);
    	}
    	
    }

    disconnect(node) {
		let neighbour = this.neighbour;
		this.neighbour = null;
		if(neighbour) {
			this.write_info('Disconnected from ' + neighbour.name);
		} else {
			//not connected anyways
		}
		
	}

    handle_message(message, sender, destination, content=null) {
    	
    	if(message == 'dhcp_info') {
    		this.ip = content[0];
    		this.subnet_mask = content[1];
    		this.default_gateway = content[2];
    		this.addressing_mode = 'dhcp';
    		this.write_info('DHCP Lease Renewed \n');
    	}
    }

    write_info(text) {
    	let date = new Date();
    	let timestamp = "[" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "] ";
    	let formatted_info = timestamp + text + '\n'
    	this.log += formatted_info
    }

    load_log() {
    	$('#log').html(this.log);
    }

    render() {
    	let html = '<div class="col-3"><div class="network-node" id="' + this.name + '"><h5>' + this.constructor.name + '</h5><img src="/static/images/' + this.image + '"/><h5>' + this.name + '</h5></div></div>';
    	return html;
    }

    generate_menu() {
    	let html = ""; 

    	//provide buttons for available actions
    	html += "<h3>Available commands:</h3>"
    	html += "<button id='ipconfig-button' class='btn btn-primary' type='button'>IP Config</button><br/>";
    	html += "<button id='renew-button' class='btn btn-primary' type='button'>Renew DHCP</button><br/>";
    	html += "<button id='static-button' class='btn btn-primary' type='button'>Set static IP</button><br/>";
    	return html;
    }

    hook_menu() {
    	//hook own generated menu buttons
    	let self = this; //obj reference for in callback
    	$('#ipconfig-button').click(function() {
    		self.write_info(self.ipconfig());
    		self.load_log();
    	});
    	$('#renew-button').click(function() {
    		self.renew_dhcp();
    		self.load_log();
    	});
    	$('#static-button').click(function() {
    		let html = '<h5>Set static IP Adressing</h5><h5 class="inline-heading">IP Address</h5><input type="text" id="static_ip"/><br/>';
    		html += '<h5 class="inline-heading">Subnet Mask</h5><input type="text" id="static_subnet_mask"/><br/>';
    		html +=  '<h5 class="inline-heading">Default Gateway</h5><input type="text" id="static_default_gateway"/><br/>';
    		html += '<button id="static_submit" class="btn btn-success">Submit</button><button id="static_cancel" class="btn btn-danger">Cancel</button>';

    		function static_ip_callback() {
		    	let ip = $('#static_ip').val();
		    	let subnet = $('#static_subnet_mask').val();
		    	let gateway = $('#static_default_gateway').val();
		    	self.static_ip(ip, subnet, gateway);
		    	$('.clicked-node').click();
    		}

    		function static_ip_cancel() {
    			//need to regenerate the context menu
    			$('.clicked-node').click();//hacky workaround to get the context menu up again without an obj ref to model.
    		}

    		$('#context-menu').html(html);
    		$('#static_submit').click(static_ip_callback);
    		$('#static_cancel').click(static_ip_cancel);
    	});
    }

    serialise() {
    	var obj = null;
    	if(this.neighbour) {
    		obj = {'ip': this.ip, 'subnet_mask': this.subnet_mask, 'default_gateway': this.default_gateway, 'MAC': this.MAC, 'neighbour': this.neighbour.name, 'addressing_mode': this.addressing_mode};
    	} else {
    		obj = {'ip': this.ip, 'subnet_mask': this.subnet_mask, 'default_gateway': this.default_gateway, 'MAC': this.MAC, 'neighbour': null, 'addressing_mode': this.addressing_mode};
    	}
    	return obj;
    	
    }

}

class Desktop extends NetworkNode {
	
	constructor(name, MAC) {
		super(name, MAC);
		this.image = 'desktop.jpg';
	}

}

class Corporate_Desktop extends Desktop { //Desktop without the option to use DHCP.

	constructor(name, MAC) {
		super(name, MAC);
	}

	generate_menu() {
    	let html = ""; 

    	//provide buttons for available actions
    	html += "<h3>Available commands:</h3>"
    	html += "<button id='ipconfig-button' class='btn btn-primary' type='button'>IP Config</button><br/>";
    	html += "<button id='static-button' class='btn btn-primary' type='button'>Set static IP</button><br/>";
    	return html;
    }

    hook_menu() {
    	//hook own generated menu buttons
    	let self = this; //obj reference for in callback
    	$('#ipconfig-button').click(function() {
    		self.write_info(self.ipconfig());
    		self.load_log();
    	});
    	$('#static-button').click(function() {
    		let html = '<h5>Set static IP Adressing</h5><h5 class="inline-heading">IP Address</h5><input type="text" id="static_ip"/><br/>';
    		html += '<h5 class="inline-heading">Subnet Mask</h5><input type="text" id="static_subnet_mask"/><br/>';
    		html +=  '<h5 class="inline-heading">Default Gateway</h5><input type="text" id="static_default_gateway"/><br/>';
    		html += '<button id="static_submit" class="btn btn-success">Submit</button><button id="static_cancel" class="btn btn-danger">Cancel</button>';

    		function static_ip_callback() {
		    	let ip = $('#static_ip').val();
		    	let subnet = $('#static_subnet_mask').val();
		    	let gateway = $('#static_default_gateway').val();
		    	self.static_ip(ip, subnet, gateway);
		    	$('.clicked-node').click();
    		}

    		function static_ip_cancel() {
    			//need to regenerate the context menu
    			$('.clicked-node').click();//hacky workaround to get the context menu up again without an obj ref to model.
    		}

    		$('#context-menu').html(html);
    		$('#static_submit').click(static_ip_callback);
    		$('#static_cancel').click(static_ip_cancel);
    	});
    }
}

class Internet extends Desktop {
	constructor(name, MAC) {
		super(name, MAC);
		this.image = 'internet.png';
	}

	generate_menu() {
		//do nothing
		return '';
	}

	hook_menu() {
		//do nothing
	}

}

class Router extends NetworkNode {
	dhcp_start = null;
	dhcp_end = null;
	dhcp_counter = 0;
	neighbours = [];

	constructor(name, MAC, ip, subnet_mask) {
		super(name, MAC);
		this.ip = ip;
		this.subnet_mask = subnet_mask;
		this.image = 'router.png';

		let parts = this.ip.split('.');
		let last = parts[3];
		this.dhcp_start = parts[0] + '.' + parts[1] + '.' + parts[2] + '.' + (parseInt(parts[3]) + 10);
		this.dhcp_end = parts[0] + '.' + parts[1] + '.' + parts[2] + '.' + (parseInt(parts[3]) + 50);
		this.default_gateway = this.ip;
	}

	connect(node) {
		if(this.neighbours.indexOf(node) != -1) {
			//already connected
			this.write_info("Error: already connected to " + node.name);
		} else {
			this.neighbours.push(node);
			this.write_info("Connected to " + node.name);
		}
		
	}

	disconnect(node) {
		let index = this.neighbours.indexOf(node);
		if(index != -1) {
			//currently connected
			
			this.neighbours.splice(index, 1);
			
			this.write_info("Disconnected from " + node.name);
		} else {
			this.write_info("Not connected to " + node.name);
		}
		
	}

	serialise() {
		let names = []
		for(let i=0; i< this.neighbours.length; i++) {
			names.push(this.neighbours[i].name);
		}
		let obj = {'names': names};
		return obj;
	}



	handle_message(message, sender, destination, content=null) {
		
		if(message == 'renew_dhcp') {
			
			let parts = this.dhcp_start.split('.');
			let last = parseInt(parts[3]) + this.dhcp_counter;
			this.dhcp_counter++;
			let assigned_address = parts[0] + '.' + parts[1] + '.' + parts[2] + '.' + last;
			let return_info = [assigned_address, this.subnet_mask, this.ip];

			if(sender.split('.').length != 4) {
				//sent with MAC
				for(let i = 0; i < this.neighbours.length; i++) {
					if(this.neighbours[i].MAC == sender) {
						this.neighbours[i].handle_message('dhcp_info', this.ip, sender, return_info);
					}
				}
			} else {
				//sent with IP
				for(let i = 0; i < this.neighbours.length; i++) {
					if(this.neighbours[i].IP == sender) {
						this.neighbours[i].handle_message('dhcp_info', this.ip, sender, return_info);
					}
				}
			}
		}
	}

	 generate_menu() {
    	let html = ""; 

    	//provide buttons for available actions
    	html += "<h3>Available commands:</h3>"
    	html += "<button id='ipconfig-button' class='btn btn-primary' type='button'>IP Config</button><br/>";
    	
    	return html;
    }

    hook_menu() {
    	//hook own generated menu buttons
    	let self = this; //obj reference for in callback
    	$('#ipconfig-button').click(function() {
    		self.write_info(self.ipconfig());
    		self.load_log();
    	});
    	
    }
}

class Firewall extends Router {
	
	whitelist = [];


	constructor(name, MAC, ip, subnet_mask) {
		super(name, MAC, ip, subnet_mask);
		this.image = 'firewall.png';
	}

	generate_menu() {
    	let html = ""; 

    	//display whitelisted ports
    	html += "<h5>Whitelisted ports:</h5><p>";

    	for(let i = 0; i < this.whitelist.length; i++) {
    		if(i < this.whitelist.length -1) {
    			html += (this.whitelist[i] + ", ");
    		} else {
    			html += this.whitelist[i];
    		}
    		
    	}
    	html += "</p>"

    	//provide buttons for available actions
    	html += "<h3>Available commands:</h3>"
    	html += "<button id='ipconfig-button' class='btn btn-primary' type='button'>IP Config</button><br/>";
    	html += "<h5 class='inline-heading'>Add port to whitelist: </h5><input id='port-add' type='text'/><button id='add-port-button' class='btn btn-primary'>Add</button><br>"
    	html += "<h5 class='inline-heading'>Remove port from whitelist: </h5><input id='port-remove' type='text'/><button id='remove-port-button' class='btn btn-primary'>Remove</button>"
    	
    	return html;
    }

    hook_menu() {
    	//hook own generated menu buttons
    	let self = this; //obj reference for in callback
    	$('#ipconfig-button').click(function() {
    		self.write_info(self.ipconfig());
    		self.load_log();
    	});

    	$('#add-port-button').click(function() {
    		let port = parseInt($('#port-add').val());
    		if(port && port != NaN && port > 0) {
    			if(self.whitelist.indexOf(port) != -1) {
    				self.write_info('Port ' + port + ' already in whitelist');
	    			self.load_log();
    			} else {
    				self.whitelist.push(port);
	    			self.write_info('Port ' + port + ' added to whitelist');
	    			self.load_log();
	    			$('.clicked-node').click();	
    			}
    			
    		} else {
    			self.write_info('Error: Port ' + port + ' is invalid.');
    			self.load_log();
    		}
    	});

    	$('#remove-port-button').click(function() {
    		let port = parseInt($('#port-remove').val());
    		if(port && port != NaN && port > 0) {
    			let index = self.whitelist.indexOf(port);
    			if(index != -1) {
    				self.whitelist.splice(index,1);
    				self.write_info('Port ' + port + ' removed from whitelist');
    				self.load_log();
    				$('.clicked-node').click();
    			} else {
    				self.write_info('Error: Port ' + port + ' not in whitelist');
    				self.load_log();
    			}
    		} else {
    			self.write_info('Error: Port ' + port + ' is invalid.');
    			self.load_log();
    		}
    	});
    	
    }

    handle_message(message, sender, destination, content=null) {
    	//OVERIDE just drop the packet
    }

    serialise() {
    	obj = {'whitelist': this.whitelist, 'neighbour': this.neighbour};
    	return obj;
    }




}

class Model {

	nodes = []

	constructor() {
		//do nothing
	}

	add_node(node) {
		this.nodes.push(node);
	}

	hook_nodes() {
		let self = this; //objct reference to use in callback

		//add event listener to each node
		$('.network-node').click(function() {
				//highlight clicked node
				$('.clicked-node').addClass('network-node');
				$('.clicked-node').removeClass('clicked-node');

				$(this).removeClass('network-node');
				$(this).addClass('clicked-node');


				//create contex window
				self.render_menu();
		});
	}

	render_nodes() {
		let num_nodes = this.nodes.length;
		let index = 0;
		let html = "<div class='row'>";
		while(index < num_nodes	) {
			html += this.nodes[index].render();
			index++;
		}
		html += '</div>';
		$('.network-pane').html(html);
	}

	render_menu() {
		let self = this; //so we can reference obj inside callbacks
		//find the active node
		let $clicked_node = $('.clicked-node');
		
		if($clicked_node.length == 0) {
			$('#context-menu').html("<h2>Click on a network node to interact with it</h2>");
		} else {
			let id = $clicked_node.attr('id');
			if(id) {
				let node = this.find_node(id);
				
				if(node) {
					node.load_log(); //load relevant log history
					let menu = node.generate_menu(); //raw html string

					if(this.nodes.length < 2) {
			    		$('#context-menu').html(menu);
			    		node.hook_menu();
			    		return;
			    	}


					//generates html for context menu
			    	let html = "<h3>Connections:</h3><br/>";

			    	if(node.neighbours && node.neighbours.length > 0) { //if a router or similar
			    		
			    		for(var index in node.neighbours) {
			    			
			    			html += "<div><h5 class='inline-heading'>" + node.neighbours[index].name + "</h5><button class='btn btn-danger disconnect-button' type='button'>Disconnect</button></div>";
			    		}
			    	} else if(node.neighbour) {
			    		html += "<div><h5 class='inline-heading'>" + node.neighbour.name + "</h5><button class='btn btn-danger disconnect-button' type='button'>Disconnect</button><div>";
			    	} else {
			    		html += "<h5>Nothing connected</h5>";
			    	}

			    	html += "<br/>";
			    	html += "<h3>Connect to another node:</h3>";

			    	//list nodes to be connected to
			    	for(var i = 0; i < this.nodes.length; i++) {
			    		if(this.nodes[i] != node) {
			    			html += "<div><h5 class='inline-heading'>" + this.nodes[i].name + "</h5><button class='btn btn-danger connect-button' type='button'>Connect</button></div><br/>";
			    		}
			    	}


			    	$('#context-menu').html(menu + html);
			    	node.hook_menu();

			    	//hook connect/disconnect buttons
			    	$('.connect-button').click(function() {
			    		let node_name = $(this).parent().children("h5").html();
			    		let node_to_connect = self.find_node(node_name);
			    		if(node_to_connect) {
			    			node.connect(node_to_connect);
			    			node_to_connect.connect(node);
			    			node.load_log();
			    			
			    		}
			    		self.render_menu();
			    	});

			    	$('.disconnect-button').click(function() {
			    		let node_name = $(this).parent().children("h5").html();
			    		let node_to_disconnect = self.find_node(node_name);
			    		if(node_to_disconnect) {
			    			node.disconnect(node_to_disconnect);
			    			node_to_disconnect.disconnect(node);
			    			node.load_log();
			    			
			    		}
			    		self.render_menu();
			    	});


			    	return;				
				}
			}
		}
	}

	find_node(id) {
		for(var node_index in this.nodes) {
			let node = this.nodes[node_index];
			if(node.name == id) {
				return node;
			}
		}
		return null;
	}
}

function setup_test() {
	model = new Model();
	pc = new Desktop('Bob\'s PC', 'A2:34:6C:AB:BC:CA');
	router = new Router('Bob\'s router', '25:DD:6B:4B:94:FB', '1.2.3.4', '255.255.255.0');
	model.add_node(pc);
	model.add_node(router);
	model.render_nodes();
	model.hook_nodes();
	model.render_menu();
}

function task_one() {
	model = new Model();
	pc = new Desktop('Bob\'s PC', '00:00:0C:FD:B7:CA');
	pc.ip = '192.168.0.2';
	pc.subnet_mask = '255.255.255.0';
	pc.default_gateway = '192.168.0.1';
	model.add_node(pc);
	model.render_nodes();
	model.hook_nodes();
	model.render_menu();
}

function task_two() {
	model = new Model();
	pc1 = new Desktop('Bob\'s PC', '00:00:0C:FD:B7:CA');
	pc2 = new Desktop('Bob\'s Laptop', '00:00:0C:29:71:BB');
	router = new Router('Bob\'s router', '25:DD:6B:4B:94:FB', '192.168.0.1', '255.255.255.0');
	model.add_node(pc1);
	model.add_node(pc2);
	model.add_node(router);
	model.render_nodes();
	model.hook_nodes();
	model.render_menu();
	$('#task-two-submit').click(function() {
		let pc1_json = pc1.serialise();
		let pc2_json = pc2.serialise();
		let obj = {'pc': pc1_json, 'laptop': pc2_json};
		var xhr = new XMLHttpRequest();
		xhr.open("POST", '/task2', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(obj));
		

		xhr.onload = function() {
			let data = JSON.parse(this.responseText);
			if(data && data.message) {
				//print to DOM
				$('#task-two-message').html(data.message);
			} else {
				//error
			}
		}
	});
}

function task_three() {
	model = new Model();
	employee_pc = new Corporate_Desktop('Employee PC', '00:00:0C:FD:B7:CA');
	employee_router = new Router('Employee Router', '25:DD:6B:4B:94:FB', '192.168.0.1', '255.255.255.0');
	finance_pc = new Corporate_Desktop('Finance PC', '00:00:0C:EE:93:F6');
	finance_router = new Router('Finance Router', '00:00:0C:D4:4C:A1', '192.168.1.1', '255.255.255.128');
	model.add_node(employee_pc);
	model.add_node(finance_pc);
	model.add_node(employee_router);
	model.add_node(finance_router);
	model.render_nodes();
	model.hook_nodes();
	model.render_menu();
	$('#task-three-submit').click(function() {
		let employee_json = employee_pc.serialise();
		let finance_json = finance_pc.serialise();
		let employee_router_json = employee_router.serialise();
		let finance_router_json = finance_router.serialise();
		let obj = {'employee_pc': employee_json, 'finance_pc': finance_json, 'employee_router': employee_router_json, 'finance_router': finance_router_json};
		var xhr = new XMLHttpRequest();
		xhr.open("POST", '/task3', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(obj));
	
		xhr.onload = function() {
			let data = JSON.parse(this.responseText);
			if(data && data.message) {
				//print to DOM
				$('#task-three-message').html(data.message);
			} else {
				//error
			}
		}
	});
}

function task_four() {
	model = new Model();
	pc = new Desktop('Bob\'s PC', '00:00:0C:FD:B7:CA');
	router = new Router('Bob\'s Router', '25:DD:6B:4B:94:FB', '192.168.0.1', '255.255.255.0');
	firewall = new Firewall('Firewall', '25:DD:6B:82:EC:FB', '192.168.0.0', '255.255.255.0');
	internet = new Internet('Internet', ' ');

	model.add_node(firewall);
	model.add_node(pc);
	model.add_node(router);
	model.add_node(internet);
	model.render_nodes();
	model.hook_nodes();
	model.render_menu();
}


