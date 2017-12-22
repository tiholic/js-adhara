(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['popup.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                    <button type=\"button\" class=\"btn btn-secondary confirm-btn\" data-dismiss=\"modal\">"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.confirmOptions : depth0)) != null ? stack1.text : stack1), depth0))
    + "</button>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"modal fade\" id=\"adharaDialog\" tabindex=\"-1\" role=\"dialog\">\n    <div class=\"modal-dialog\" role=\"document\">\n        <div class=\"modal-content\">\n            <div class=\"modal-header\">\n                <h5 class=\"modal-title\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</h5>\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                    <span aria-hidden=\"true\">&times;</span>\n                </button>\n            </div>\n            <div class=\"modal-body\">\n                <div class=\"row\">\n                    <div class=\"col-md-12\">\n                        <b><div class=\"modal-msg\">"
    + alias4(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"message","hash":{},"data":data}) : helper)))
    + "</div></b>\n                    </div>\n                </div>\n            </div>\n            <div class=\"modal-footer\">\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.confirmOptions : depth0)) != null ? stack1.isConfirm : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
templates['table.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "        <button style=\"display: inline-block; float: left;\" class=\"btn btn-sm btn-primary\">Add new "
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.config : depth0)) != null ? stack1.title : stack1), depth0))
    + "</button>\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "        <button style=\"display: inline-block; float: right; margin: 0 2px;\" class=\"btn btn-sm btn-dark prev\">prev</button>\n        <button style=\"display: inline-block; float: left; margin: 0 2px;\" class=\"btn btn-sm btn-info\">next</button>\n";
},"5":function(container,depth0,helpers,partials,data,blockParams) {
    return "                    <th>"
    + container.escapeExpression(container.lambda(blockParams[0][0], depth0))
    + "</th>\n";
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "                <tr adhara-datum-row=\""
    + container.escapeExpression(container.lambda(blockParams[0][1], depth0))
    + "\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depths[1] != null ? depths[1].columns : depths[1]),{"name":"each","hash":{},"fn":container.program(8, data, 2, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + "                </tr>\n";
},"8":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "                        <td adhara-datum-col=\""
    + alias2(alias1(blockParams[1][1], depth0))
    + "-"
    + alias2(alias1(blockParams[0][0], depth0))
    + "\">"
    + alias2(alias1(((stack1 = blockParams[1][0]) != null ? stack1.column : stack1), depth0))
    + "</td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : (container.nullContext || {});

  return "<div id=\"adharaTable_"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.config : depth0)) != null ? stack1.title : stack1), depth0))
    + "\" class=\"adhara-table-container\">\n    <div>\n        <h3>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.config : depth0)) != null ? stack1.title : stack1), depth0))
    + "</h3>\n    </div>\n    <div>\n"
    + ((stack1 = helpers["if"].call(alias3,((stack1 = (depth0 != null ? depth0.config : depth0)) != null ? stack1.add_new : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias3,((stack1 = (depth0 != null ? depth0.config : depth0)) != null ? stack1.nav : stack1),{"name":"if","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + "    </div>\n    <div class=\"adhara-table-wrapper\">\n        <table class=\"table table-bordered table-hover\">\n            <thead>\n            <tr>\n"
    + ((stack1 = helpers.each.call(alias3,((stack1 = (depth0 != null ? depth0.config : depth0)) != null ? stack1.columns : stack1),{"name":"each","hash":{},"fn":container.program(5, data, 2, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + "            </tr>\n            </thead>\n            <tbody>\n"
    + ((stack1 = helpers.each.call(alias3,((stack1 = (depth0 != null ? depth0.config : depth0)) != null ? stack1.data : stack1),{"name":"each","hash":{},"fn":container.program(7, data, 2, blockParams, depths),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + "            </tbody>\n        </table>\n    </div>\n</div>";
},"useData":true,"useDepths":true,"useBlockParams":true});
})();