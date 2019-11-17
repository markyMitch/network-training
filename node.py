class NetworkNode(object):

    def __init__(self, name):
        self.name = name
        self.locked = False

    def lock(self):
        self.locked = True

    def unlock(self):
        self.locked = False


class Connection(object):

    def __init__(self):
