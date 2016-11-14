function RollConfig(dieType, modifier, numberOfRolls) {
    this.dieType = parseInt(dieType);
    this.modifier = parseInt(modifier);
    this.numberOfRolls = parseInt(numberOfRolls);
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
