handlebars ../templates/*.hbs -f ../js/templates.js -e hbs

if [ -f ../js/templates.js ]
then
	echo "==> Handlebars compiled successfully."
else
	echo "==> Handlebars compilation failed !!!!!!!"
fi