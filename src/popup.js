window.onload = init;

var advancedIsShown = false;
var config = null;
var rollsLeft = ROLLS_PER_ANIMATION;
var rollTimer = null;

function init() {
    loadConfig(function() {
        addEventHandlers();
        hideAdvancedInit();
        loadMacrosList();
        updateRollButton();
    });
}

function loadConfig(callback) {
    chrome.storage.sync.get(PRIMARY_CONFIG_KEY, function(items) {
        config = items[PRIMARY_CONFIG_KEY];
        callback();
    });
}

function addEventHandlers() {
    $("#roll-button").click(rollClickHandler)
    $("#toggle-advanced").click(toggleAdvanced);
    $("#options").click(openOptions);

    $("#die-type-container").on("change", updateRollButton);
    $("#num-rolls").on("input", updateRollButton);
    $("#modifier").on("input", updateRollButton);
}

function updateRollButton() {
    var rollButton = $("#roll-button");
    var disabled = !DICE_NOTATION_REGEX.test(captureCurrentRollConfig().toString());
    rollButton.prop("disabled", disabled);

    var buttonLabel = "Roll " + captureCurrentRollConfig().toString() + "!";
    if (disabled) {
        buttonLabel = "Enter a valid roll";
    }
    rollButton.prop("value", buttonLabel);
}

function rollClickHandler(event) {
    var rollConfig = captureCurrentRollConfig();
    rollsLeft = ROLLS_PER_ANIMATION;
    roll(rollConfig);
}

function loadMacrosList() {
    var macrosList = config.macros;
    if(macrosList.length > 0) {
		var newHTML = ""
		for(var i = 0; i < macrosList.length; i++) {
            var name = macrosList[i].name;
            var rollConfig = RollConfig.cast(macrosList[i].rollConfig).toString();
            var rollConfigHTML = " (" + rollConfig + ")";
            var htmlStart = "<input type=button class='macroButton' value='" + name;
            newHTML += htmlStart;
            if (!config.onlyShowMacroName) {
                newHTML += rollConfigHTML;
            }
            var htmlEnd = "' id='macro" + i + "'>";
			newHTML += htmlEnd;
		}
		$("#macros_list").html(newHTML);
		initMacroBindings();
	}
}


function initMacroBindings() {
    var macrosList = config.macros;
	for(var i = 0; i < macrosList.length; i++) {
		var macroButton = document.getElementById('macro' + i);
		macroButton.onclick = (function(i) {
	      return function() {
              var rollConfig = config.macros[i].rollConfig;
              console.log(config);
              console.log(rollConfig);
              roll(rollConfig);
	      };
	    })(i);
	}
}

/**
 * Takes a RollConfig and simulates a dice roll.
 **/
function roll(rollConfig) {
    var total = 0;
    var rollsArray = [];
    for (var rollNumber = 0; rollNumber < rollConfig.numberOfRolls; rollNumber++) {
        var currentRoll = randInt(1, rollConfig.dieType);
        total += currentRoll;
        rollsArray[rollNumber] = currentRoll;
    }
    total += rollConfig.modifier;

    if (config.showRollAnimation) {
        if (rollsLeft > 0) {
            if (!$("#result").hasClass("temp_roll")) {
                $("#result").addClass("temp_roll");
            }
            rollTimer = setTimeout(function() {
                roll(rollConfig);
                rollsLeft--;
            }, ROLL_DELAY + (ROLLS_PER_ANIMATION - rollsLeft) * ROLL_INCREMENT);
        } else {
            $("#result").removeClass("temp_roll");
            rollsLeft = ROLLS_PER_ANIMATION;
            clearTimeout(rollTimer);
        }
    }

    setResult(total);
    $("#toggle-advanced").show();
    if (config.alwaysShowAdvanced) {
        showAdvanced();
    }
    setAdvancedResultsFromArray(rollsArray, 1, rollConfig.dieType);
}

/**
 * Returns a random integer between lowerBounds and upperBounds (inclusive)
 **/
function randInt(lowerBounds, upperBounds) {
    if (lowerBounds > upperBounds) {
        throw new Error("Lower bound cannot be greater than upper bound.");
    }
    return (Math.floor(Math.random() * upperBounds) + lowerBounds);
}

function openOptions() {
    if (chrome.runtime.openOptionsPage) {
        // New way to open options pages, if supported (Chrome 42+).
        chrome.runtime.openOptionsPage();
    } else {
        // Reasonable fallback.
        window.open(chrome.runtime.getURL('options.html'));
    }
}

/**
 * Takes a number and sets it to be the current roll result
 **/
function setResult(number) {
    $("#result").html(number);
}

/**
 * Takes an array of rolls (ints), the minimum possible result, and the maximum possible result
 * and populates the "Advanced Results" section.
 **/
function setAdvancedResultsFromArray(arr, minPossibleResult, maxPossibleResult) {
	var table = document.getElementById("results-table");

    // clear the table
	table.innerHTML = "";

    // populate table from array
	for (var i = arr.length - 1; i >= 0; i--) {

		var num = arr[i];
		var newRow = table.insertRow(0);

		//count column
		var countCell = newRow.insertCell(0);
		countCell.innerHTML = "#" + (i + 1);

		//roll column
		var rollCell = newRow.insertCell(-1);
		rollCell.innerHTML = num;

        if(num == maxPossibleResult) {
            rollCell.className += " nat-max";
        } else if(num == minPossibleResult) {
            rollCell.className += " nat-min";
        }
	};

    // hide the min/max view if the array length == 1
	if(arr.length == 1) {
        $("#minmax-table").hide();
	} else {
        $("#minmax-table").show();
        var min = Math.min.apply(Math, arr);
        var max = Math.max.apply(Math, arr);
		setMinAndMax(min, max);
	}
}

function setMinAndMax(min, max) {
    $("#minmax-table-min").html(min);
    $("#minmax-table-max").html(max);
}

function toggleAdvanced() {
	if(advancedIsShown) {
		hideAdvanced();
	} else {
		showAdvanced();
	}
}

function showAdvanced() {
    $("#advanced").show();
	advancedIsShown = true;
}

function hideAdvanced() {
    $("#advanced").hide();
	advancedIsShown = false;
}

function hideAdvancedInit() {
    hideAdvanced();
    $("#minmax-table").hide();
    $("#toggle-advanced").hide();
}

/**
 * Returns the current RollConfig
 **/
function captureCurrentRollConfig() {
    var dieType = $("input[name=die-type]:checked").val();
    var modifier = $("#modifier").val();
    var numberOfRolls = $("#num-rolls").val();

    return new RollConfig(numberOfRolls, dieType, modifier);
}
