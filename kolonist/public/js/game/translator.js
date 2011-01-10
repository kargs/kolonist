var translator = new Array();
translator['townhall'] = 'Townhall';
translator['homestead'] = 'Homestead';
translator['bakery'] = 'Bakery';
translator['forge'] = 'Forge';
translator['steelworks'] = 'Steelworks';
translator['sawmill'] = 'Sawmill';
translator['storehouse'] = 'Storehouse';
translator['barracks'] = 'Barracks';
translator['brickyard'] = 'Brickyard';
translator['buildAction'] = 'Build';
translator['buildingChooser_requirement'] = 'Requirement';
translator['buildingChooser_gain'] = 'Gain';
translator['buildingChooser_capacity'] = 'Capacity';
translator['buildingChooser_other'] = 'Other';
translator['settlers_requirement'] = 'Settlers';
translator['soldiers_requirement'] = 'Soldiers';
translator['armament_requirement'] = 'Armament';
translator['food_requirement'] = 'Food';
translator['wood_requirement'] = 'Wood';
translator['iron_requirement'] = 'Iron';
translator['brick_requirement'] = 'Bricks';
translator['settlers_gain'] = 'Settlers';
translator['soldiers_gain'] = 'Soldiers';
translator['armament_gain'] = 'Armament';
translator['food_gain'] = 'Food';
translator['wood_gain'] = 'Wood';
translator['iron_gain'] = 'Iron';
translator['brick_gain'] = 'Bricks';
translator['settlers_max'] = 'Settlers';
translator['soldiers_max'] = 'Soldiers';
translator['armament_max'] = 'Armament';
translator['food_max'] = 'Food';
translator['wood_max'] = 'Wood';
translator['iron_max'] = 'Iron';
translator['brick_max'] = 'Bricks';
translator['workers_max'] = 'Workers';
translator['defense'] = 'Defense';
translator['food_by_worker'] = 'Food by worker';

translator['free'] = 'No-man\'s land';
translator['armyMove'] = 'Move army to another province';
translator['changeProvinceNameTitle'] = 'Change province name';
translator['buildingChooser'] = 'Choose a building to create';
translator['anyRequirements'] = 'This building has no requirements.';
translator['lacks'] = 'lacks';
translator['level'] = 'lvl';
translator['buildingUpgrader'] = 'Upgrade the building';
translator['1'] = '1';
translator['2'] = '2';
translator['3'] = '3';
translator['4'] = '4';
translator['msgDlgTitle'] = 'Most recent messages';
translator['msgType'] = 'Type';
translator['msgContent'] = 'Message';
translator['msgDate'] = 'Date';
translator['storage'] = 'Surplus';
translator['resources'] = 'Shortage';
translator['fight-win'] = 'Victory';
translator['fight-loose'] = 'Defeat';
translator['settlers-eat'] = 'Starvation';
translator['workers-eat'] = 'Starvation';
translator['noMessages'] = 'No messages are available';
translator['buildingPropGroup_requirement'] = 'Create / upgrade requirements';
translator['buildingPropGroup_gain'] = 'Building gains';
translator['buildingPropGroup_max'] = 'Building capacity';
translator['buildingPropGroup_misc'] = 'Miscellaneous information';
translator['buildingParam'] = 'Level';
translator['duildingDetals'] = 'Building details'





function translate(id) {
    if(translator[id] === undefined) {
        return 'XXX_'+id;
    }
    return translator[id];
}