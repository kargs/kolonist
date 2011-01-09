<?php defined('SYSPATH') or die('No direct access allowed.');

return array (
	'cronInterval' => 60, // 60, Seconds to run cron
	'foodSettlerInterval' => 3600, // 3600, Seconds for settlers to eat food
	'foodBySettler' => 0.001, // 0.001, How many food one settler eats every foodSettlerInterval
	'fightAbsoluteLuckLevel' => 10, // 10, Maximum attack / defense ratio for giving chance to win by luck
	'fightRatioCap' => 100, // 100, Maximum attack / defense ratio after which one can't loose more troops
	'fightMaxPercentLoss' => 30, // 30, Maximum percentage of troops one can loose when the ratio is maximal (50% is added to this value)
	'fightRandomLoss' => 10, // 10, Maximum percentage which can be added (randomly) or substracted from the general loss percentage
	'fightBuildingsDefense' => 20, // 20, Percent of buildings' defense value which is added to general defense value
);
