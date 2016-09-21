var gui = require('nw.gui');
 
		 
var win = gui.Window.get();

var menubar = new gui.Menu({
    type: 'menubar'
});
 
var menu = new gui.Menu();

menu.append(new gui.MenuItem({
    label: 'Nouveau',
    click: function() {
    	gui.Window.open('./app/views/index.html');
    }
}));

menu.append(new gui.MenuItem({
    label: 'Action 2',
    submenu : new gui.Menu()
}));


menu.append(new gui.MenuItem({
    label: 'Fermer',
    click: function () {
		gui.Window.get().close();
	}
}));

menu.items[1].submenu.append(new gui.MenuItem({
	type: 'separator'
}));
 
 
menubar.append(new gui.MenuItem({ label: 'Fichier', submenu: menu}));
 
win.menu = menubar;