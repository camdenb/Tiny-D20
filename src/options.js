window.onload = init;

var PRIMARY_CONFIG_KEY = "primary_configuration";
var currentConfiguration = null;

function init() {
    addEventHandlers();
    loadOptionsFromStorage();
}

function addEventHandlers() {
    $("#color").change(saveCurrentConfiguration);
    $("#alwaysShowAdvanced").change(saveCurrentConfiguration);
    $("#rollAnimation").change(saveCurrentConfiguration);
}

function loadOptionsFromStorage() {
    chrome.storage.sync.get(PRIMARY_CONFIG_KEY, function(items) {
        var config = items[PRIMARY_CONFIG_KEY];
        setConfiguration(config);
    });
}

function setConfiguration(config) {
    currentConfiguration = config;
    console.log("retrieved!", config);
    $("#color").val(config.iconColor);
    $("#alwaysShowAdvanced").prop("checked", config.alwaysShowAdvanced);
    $("#rollAnimation").prop("checked", config.showRollAnimation);
}

function saveCurrentConfiguration() {
    var color = $("#color").val();
    var alwaysShowAdvanced = $("#alwaysShowAdvanced").prop("checked");
    var showRollAnimation = $("#rollAnimation").prop("checked");
    var macros = []; // @TODO
    newConfig = new Configuration(color, alwaysShowAdvanced, showRollAnimation, macros);
    currentConfiguration = newConfig;

    chrome.storage.sync.set({ [PRIMARY_CONFIG_KEY]: newConfig }, function() {
        console.log("saved!", newConfig);
    });
}
