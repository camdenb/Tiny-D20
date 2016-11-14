function RollConfig(numberOfRolls, dieType, modifier) {
    console.log(numberOfRolls, dieType, modifier);
    this.numberOfRolls = parseInt(numberOfRolls);
    this.dieType = parseInt(dieType);
    this.modifier = parseInt(modifier);
}

RollConfig.prototype.toString = function() {
    var string = this.numberOfRolls + "d" + this.dieType;
    if (this.modifier) {
        string += "+" + this.modifier;
    }
    return string;
}

/**
 * iconColor: String
 * alwaysShowAdvanced: Boolean
 * showRollAnimation: Boolean
 * macros: Macro[]
 **/
function Configuration(iconColor, alwaysShowAdvanced, showRollAnimation, macros) {
    this.iconColor = iconColor;
    this.alwaysShowAdvanced = alwaysShowAdvanced;
    this.showRollAnimation = showRollAnimation;
    this.macros = macros;
}

/**
 * name: String
 * rollConfig: RollConfig
 **/
function Macro(name, rollConfig) {
    this.name = name;
    this.rollConfig = rollConfig;
}
