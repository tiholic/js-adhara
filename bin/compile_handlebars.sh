handlebars ../templates/*.hbs -f ../dist/js/templates.js

if [ -f ../js/templates.js ]
then
	echo "==> Handlebars compiled successfully."
else
	echo "==> Handlebars compilation failed !!!!!!!"
fi