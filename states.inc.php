<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 * bloodstones game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: $this->checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!


// define contants for state ids
if (!defined('STATE_END_GAME')) { // ensure this block is only invoked once, since it is included multiple times
   define("STATE_FACTIONSELECT", 2);
   define("STATE_INITNEWGAME", 3);
   define("STATE_NEXTPLAYER", 4);
   define("STATE_PLAYERCAPTURE", 5);
   define("STATE_PLAYERUNDEAD", 6);
   define("STATE_PLAYERMAIN", 7);
   define("STATE_PLAYERVILLAGES", 8);
   define("STATE_CITADELPLACEMENT", 9);
   define("STATE_NEXTCITADEL", 10);
   define("STATE_FREEBUILD", 11);
   define("STATE_FREEBUILD_CHAOSHORDE", 12);
   define("STATE_FREEBUILD_CHAOSHORDE_SETUP", 13);
   define("STATE_FACTIONSELECT_INIT", 14);
   define("STATE_FREEBUILD_FINISH", 15);
   define("STATE_WITHDRAW_SETUP", 40);
   define("STATE_WITHDRAW_CHOOSE", 41);
   define("STATE_BATTLE_SETUP", 42);
   define("STATE_BATTLE_TILE", 43);
   define("STATE_BATTLE_NEXT", 44);
   define("STATE_BATTLE_RESOLVE", 45);
   define("STATE_BATTLE_END", 46);
   define("STATE_BATTLE_CLEANUP", 47);
   define("STATE_BATTLE_RETREAT", 48);
   define("STATE_GAMEOVER", 80);
   define("STATE_END_GAME", 99);
}

$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => STATE_FACTIONSELECT_INIT )
    ),
    
    // Note: ID=2 => your first state

    STATE_FACTIONSELECT_INIT => array(
        "name" => "factionSelect_init",
        "description" => "",
        "type" => "game",
        "action" => "st_factionSelect_init",
        "transitions" => array("factionSelect" => STATE_FACTIONSELECT, "freeBuild_finish" => STATE_FREEBUILD_FINISH)
    ),
	
    STATE_FACTIONSELECT => array(
        "name" => "factionSelect",
        "type" => "multipleactiveplayer",
		"action" => "st_factionselect",
		"description" => "Waiting for other players to choose...",
		"descriptionmyturn" => "Choose your faction!",
		"possibleactions" => array("action_chooseFaction","action_unchooseFaction","action_skip"),
		"transitions" => array("initNewGame" => STATE_INITNEWGAME)
	),
	
	STATE_INITNEWGAME => array(
		"name" => "initNewGame",
		"type" => "game",
		"action" => "st_initNewGame",
		"args" => "args_initNewGame",
    	"transitions" => array("citadelPlacement" => STATE_CITADELPLACEMENT)
    ),
	
	STATE_CITADELPLACEMENT => array(
		"name" => "citadelPlacement",
		"description" => clienttranslate('${actplayer} is deciding where to put their citadel...'),
		"descriptionmyturn" => clienttranslate('Choose a province to place your citadel'),
		"type" => "activeplayer",
		"args" => "args_citadelPlacement",
		"possibleactions" => array("action_playerPlaceCitadel","action_skip"),
		"transitions" => array("nextCitadel" => STATE_NEXTCITADEL)
	),
	
	STATE_NEXTCITADEL => array(
		"name" => "nextCitadel",
		"type" => "game",
        "action" => "st_nextCitadel",
		"transitions" => array("citadelPlacement" => STATE_CITADELPLACEMENT, "freeBuild" => STATE_FREEBUILD)
	),
	
	STATE_FREEBUILD => array(
		"name" => "freeBuild",
		"descriptionmyturn" => clienttranslate('You can now choose your starting units to deploy (+5 free build points)'),
		"description" => clienttranslate('You must wait for everyone else to deploy their starting units.'),
		"type" => "multipleactiveplayer",
        "action" => "st_freeBuild",
		"args" => "args_freeBuild",
		"possibleactions" => array("action_skip","action_tryPayAction","action_playerDebug"),
		"transitions" => array("freeBuild_chaosHorde_setup" => STATE_FREEBUILD_CHAOSHORDE_SETUP)
	),
	
	STATE_FREEBUILD_CHAOSHORDE_SETUP => array(
		"name" => "freeBuild_chaosHorde_setup",
		"type" => "game",
        "action" => "st_freeBuild_chaosHorde_setup",
		"transitions" => array("freeBuild_chaosHorde" => STATE_FREEBUILD_CHAOSHORDE, "freeBuild_finish" => STATE_FREEBUILD_FINISH)
	),
	
	STATE_FREEBUILD_CHAOSHORDE => array(
		"name" => "freeBuild_chaosHorde",
		"descriptionmyturn" => clienttranslate('You can now choose your starting horde to deploy (+10 free build points)'),
		"description" => clienttranslate('${actplayer} as the Chaos Horde is deciding where to place their starting horde...'),
		"type" => "activeplayer",
		"args" => "args_freeBuild_chaosHorde",
		"possibleactions" => array("action_skip","action_tryPayAction","action_playerDebug"),
		"transitions" => array("freeBuild_finish" => STATE_FREEBUILD_FINISH)
	),
	
	STATE_FREEBUILD_FINISH => array(
		"name" => "freeBuild_finish",
		"type" => "game",
        "action" => "st_freeBuild_finish",
		"transitions" => array("nextPlayer" => STATE_NEXTPLAYER)
	),
	
    STATE_NEXTPLAYER => array(
        "name" => "nextPlayer",
        "type" => "game",
        "action" => "st_nextPlayer",
		"updateGameProgression" => true,
        "transitions" => array( "playerCapture" => STATE_PLAYERCAPTURE, "playerUndead" => STATE_PLAYERUNDEAD, "playerMain" => STATE_PLAYERMAIN, "citadelPlacement" => STATE_CITADELPLACEMENT, "gameOver" => STATE_GAMEOVER)
    ),
	
    STATE_PLAYERCAPTURE => array(
		"name" => "playerCapture",
		"description" => clienttranslate('${actplayer} is deciding whether to capture villages...'),
		"descriptionmyturn" => clienttranslate('${you} can capture villages now.'),
		"type" => "activeplayer",
		"args" => "args_playerCapture",
		"possibleactions" => array("action_captureVillage", "action_tryPayAction","action_skip","action_playerDebug"),
		"transitions" => array("playerUndead" => STATE_PLAYERUNDEAD, "playerMain" => STATE_PLAYERMAIN)
    ),
    
    STATE_PLAYERUNDEAD => array(
		"name" => "playerUndead",
		"description" => clienttranslate('${actplayer} is moving undead...'),
		"descriptionmyturn" => clienttranslate('${you} can move your undead now.'),
		"type" => "activeplayer",
		"possibleactions" => array("action_moveUndead","action_tryArmyStackSplit","action_tryArmyStackMerge","action_skip","action_playerDebug"),
		"transitions" => array("playerMain" => STATE_PLAYERMAIN)
	),
	
	STATE_PLAYERMAIN => array(
		"name" => "playerMain",
		"description" => clienttranslate('${actplayer} is in their main phase.'),
		"descriptionmyturn" => clienttranslate('It is your turn. You can build, battle or move.'),
		"type" => "activeplayer",
		"args" => "args_playermain",
		"possibleactions" => array(
			//debug actions
			"action_playerSpawnTestArmy",
			"action_playerCycleHand",
			"action_findBattle",
			"action_spawnBattle",
			
			//player actions
			"action_startBattle",
			"action_tryArmyStackSplit",
			"action_tryArmyStackMerge",
			"action_tryPayAction",
			"action_skip",
			"action_beginBuildVillages",
			"action_earlyEndTurn",
			"action_playerDebug"
			),
    	"transitions" => array("playerVillages" => STATE_PLAYERVILLAGES, "setupWithdraw" => STATE_WITHDRAW_SETUP, "nextPlayer" => STATE_NEXTPLAYER)
    ),
    
    STATE_PLAYERVILLAGES => array(
		"name" => "playerVillages",
		"description" => clienttranslate('${actplayer} is deciding whether to build villages...'),
		"descriptionmyturn" => clienttranslate('${you} can build villages now.'),
		"type" => "activeplayer",
		"args" => "args_playerVillages",
		"possibleactions" => array("action_playerBuildVillages","action_skip","action_tryPayAction"),
		"transitions" => array("nextPlayer" => STATE_NEXTPLAYER)
    ),
    
    STATE_WITHDRAW_SETUP => array(
		"name" => "setupWithdraw",
		"type" => "game",
		"action" => "st_setupWithdraw",
		"transitions" => array("chooseWithdraw" => STATE_WITHDRAW_CHOOSE, "setupBattle" => STATE_BATTLE_SETUP)
    ),
    
    STATE_WITHDRAW_CHOOSE => array(
		"name" => "chooseWithdraw",
		"description" => clienttranslate('${actplayer} is deciding whether to withdraw'),
		"descriptionmyturn" => clienttranslate('${you} must decide whether to withdraw'),
		"type" => "activeplayer",
		"args" => "args_chooseWithdraw",
		"action" => "st_chooseWithdraw",
		"possibleactions" => array("action_withdraw","action_rejectWithdraw",'action_skip'),
		"transitions" => array("setupBattle" => STATE_BATTLE_SETUP, "battleCleanup" => STATE_BATTLE_CLEANUP)
    ), 
    
    STATE_BATTLE_SETUP => array(
		"name" => "setupBattle",
		"type" => "game",
		"action" => "st_setupBattle",
		"transitions" => array("nextBattleTile" => STATE_BATTLE_NEXT)
    ),
	
    STATE_BATTLE_NEXT => [
        "name" => "nextBattleTile",
        "type" => "game",
		"action" => "st_nextBattleTile",
        "transitions" => ['battleTile' => STATE_BATTLE_TILE, "battleResolve" => STATE_BATTLE_RESOLVE]
      ],
    
    STATE_BATTLE_TILE => [
        "name" => "battleTile",
        "description" => clienttranslate('It is ${actplayer}\'s turn to swap a battle tile.'),
        "descriptionmyturn" => clienttranslate('${you} must decide whether to swap a battle tile.'),
        "type" => "activeplayer",
		"args" => "args_battleTile",
        "possibleactions" => ["action_swapTile",'action_skip'],
        "transitions" => ['nextBattleTile' => STATE_BATTLE_NEXT]
      ],
    
    STATE_BATTLE_RESOLVE => array(
		"name" => "battleResolve",
		"type" => "game",
		"action" => "st_battleResolve",
        "transitions" => array("battleEnd" => STATE_BATTLE_END, "setupBattle" => STATE_BATTLE_SETUP)
    ),
    
    STATE_BATTLE_END => array(
		"name" => "battleEnd",
		"description" => clienttranslate('${winner_name} have won the battle!'),
		"descriptionmyturn" => clienttranslate('${you} have lost the battle!'),
		"type" => "activeplayer",
		"args" => "args_battleEnd",
		"possibleactions" => array("action_sacrificeUnit",'action_skip'),
        "transitions" => array("retreat" => STATE_BATTLE_RETREAT, "battleCleanup" => STATE_BATTLE_CLEANUP)
    ),
    
    STATE_BATTLE_RETREAT => array(
		"name" => "retreat",
		"description" => clienttranslate('${actplayer} is retreating from battle'),
		"descriptionmyturn" => clienttranslate('Choose a province to retreat to.'),
		"type" => "activeplayer",
		"args" => "args_retreat",
		"possibleactions" => array("action_retreat",'action_skip'),
        "transitions" => array("battleCleanup" => STATE_BATTLE_CLEANUP)
    ),
    
    STATE_BATTLE_CLEANUP => array(
		"name" => "battleCleanup",
		"type" => "game",
		"action" => "st_battleCleanup",
        "transitions" => array("playerMain" => STATE_PLAYERMAIN)
    ),
    
    STATE_GAMEOVER => array(
		"name" => "gameOver",
		"type" => "game",
		"action" => "st_gameOver",
        "transitions" => array("gameEnd" => STATE_END_GAME)
    ),
    
    // Final state.
    // Please do not modify (and do not overload action/args methods).
    STATE_END_GAME => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )
);