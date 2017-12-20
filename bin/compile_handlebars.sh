rm ../js/template.js

handlebars ../template/*.hbs -f ../js/template.js

if [ -f ../js/template.js ]
then
	echo "==> Handlebars compiled successfully."
else
	echo "==> Handlebars compilation failed !!!!!!!"
fi