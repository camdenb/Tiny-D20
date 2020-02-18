var DEFAULT_CONFIGURATION = new Configuration("white", false, true, [], false);

function RollConfig(numberOfRolls, dieType, modifier) {
    this.numberOfRolls = numberOfRolls;
    this.dieType = parseInt(dieType);
    if (modifier && modifier != 0) {
        this.modifier = modifier;
    } else {
        this.modifier = 0;
    }
}

RollConfig.prototype.toString = function() {
    var string = this.numberOfRolls + "d" + this.dieType;
    if (this.modifier) {
        var sign = this.modifier > 0 ? '+' : ''
        string += sign + this.modifier;
    }
    return string;
}

RollConfig.cast = function(rollConfig) {
    return new RollConfig(rollConfig.numberOfRolls, rollConfig.dieType, rollConfig.modifier);
}

/**
 * iconColor: String
 * alwaysShowAdvanced: Boolean
 * showRollAnimation: Boolean
 * macros: Macro[]
 * onlyShowMacroName: Boolean
 **/
function Configuration(iconColor, alwaysShowAdvanced, showRollAnimation, macros, onlyShowMacroName) {
    this.iconColor = iconColor;
    this.alwaysShowAdvanced = alwaysShowAdvanced;
    this.showRollAnimation = showRollAnimation;
    this.macros = macros;
    this.onlyShowMacroName = onlyShowMacroName;
}

/**
 * name: String
 * rollConfig: RollConfig
 **/
function Macro(name, rollConfig) {
    this.name = name;
    this.rollConfig = rollConfig;
}
