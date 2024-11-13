<?php
 /**
  *------
  * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
  * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
  * 
  * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
  * See http://en.boardgamearena.com/#!doc/Studio for more information.
  * -----
  * 
  * bloodstones.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );
require_once ('modules/battle.php');
require_once ('modules/province.php');
require_once ('modules/tiles.php');
require_once ('modules/faction.php');
require_once ('modules/army.php');
require_once ('modules/setup.php');
require_once ('modules/player.php');
require_once ('modules/retreat_withdraw.php');
require_once ('modules/village.php');
require_once ('modules/citadel.php');
require_once ('modules/action.php');
require_once ('modules/action_capture.php');
require_once ('modules/action_move.php');
require_once ('modules/action_build.php');
require_once ('modules/action_undead.php');

class bloodstones extends Table
{
	/* Some defines */
	
	const ACTION_UNKNOWN = 0;
	const ACTION_MOVE = 1;
	const ACTION_SPLIT = 2;
	const ACTION_BUILD = 3;
	const ACTION_SWAP = 4;
	const ACTION_BUILDVILLAGE = 5;
	const ACTION_CAPTURE = 6;
	const ACTION_UNDEAD = 7;

	const SELECT_ARMY_NONE = 0;
	const SELECT_ARMY_SOURCE = 1;
	const SELECT_ARMY_TARGET = 2;
	
	const FACTION_HORSELORDS = 0;
	const FACTION_HILLFOLK = 1;
	const FACTION_DRAGONRIDERS = 2;
	const FACTION_CORSAIRS = 3;
	const FACTION_NECROMANCERS = 4;
	const FACTION_CHAOSHORDE = 5;
	
	const VILLAGE_SUCCESS = 0;
	const VILLAGE_SKIP = 1;
	const VILLAGE_FAIL_UNKNOWN = 2;
	const VILLAGE_FAIL_PIPS = 3;		//not enough tiles paid
	const VILLAGE_FAIL_PROV = 4;		//wrong province type
	const VILLAGE_FAIL_AVAIL = 5;		//no free villages avail
	const VILLAGE_FAIL_HAND = 6;		//trying to pay with tile not in hand
	const VILLAGE_FAIL_SLOTS = 7;		//too many villages already there
	const VILLAGE_FAIL_ENEMIES = 8;		//enemy units present
	const VILLAGE_FAIL_FRIENDLIES = 9;	//no friendlies present or in adjacent province	//this is not a real rule, but im leaving the define anyway just in case
	const VILLAGE_FAIL_CITADEL = 10;	//friendly/any citadel present 
	const VILLAGE_FAIL_TERRAIN = 11;	//mountain/sea/desert province
	
	//im slowly transferring the system above ^ into a generic one for all payment actions
	const ACTION_SUCCESS = 0;
	const ACTION_SKIP = 1;
	const ACTION_FAIL_UNKNOWN = 2;
	const ACTION_FAIL_COST = 3;			//not enough tiles paid
	const ACTION_FAIL_HAND = 6;			//trying to pay with tile not in hand
	const ACTION_FAIL_FRIENDLIES = 9;	//no friendlies present or in adjacent province
	const ACTION_FAIL_TERRAIN = 11;		//mountain/sea/desert province
	const ACTION_FAIL_STATE = 12;		//that action isn't allowed in this game state
	const ACTION_FAIL_LIMITONCE = 13;	//that action can only be done once per turn
	
	//length of a row on the sprite sheet as measured in number of tiles
	const SPRITESHEET_ROW_TILES = 14;
	
	const TILE_UNIT_MIN = 0;
	
	//base unit types (eg a single row of the sprite sheet)
	const UNIT_BLANK = 0;
	const UNIT_RESOURCES = 1;
	const UNIT_ATTACKER = 2;
	const UNIT_SWORD = 3;
	const UNIT_SHIELD = 4;
	const UNIT_ARCHER = 5;
	const UNIT_CAVALRY = 6;
	const UNIT_CASTLE = 7;
	const UNIT_SHIP = 8;
	const UNIT_SIEGE = 9;
	const UNIT_LEADER = 10;
	const UNIT_SPECIALONE = 11;
	const UNIT_SPECIALTWO = 12;
	const UNIT_CITADEL = 13;
	
	//unique tile defines, most of these are specialone or specialtwo (but not all)
	const TILE_GIANT = 25;
	const TILE_KOBOLD = 30;
	const TILE_DRAGON = 39;
	const TILE_GOBLIN = 58;
	const TILE_NECROMANCER = 67;
	const TILE_UNDEAD = 68;
	
	const TILE_UNIT_MAX = 83;
	
	//used for battles
	const TILE_DICE_MIN = 86;
	const TILE_DICE_NUM_TYPES = 4;
	const TILE_DICE_MAX = 103;	//this one is unused i think
	
	use battle;
	use province;
	use tiles;
	use faction;
	use army;
	use setup;
	use player_utils;
	use retreat_withdraw;
	use village;
	use citadel;
	use action;
	use action_capture;
	use action_move;
	use action_build;
	use action_undead;
	
	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array(
            //    "my_first_global_variable" => 10,
            //    "my_second_global_variable" => 11,
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
			"next_army_id" => 10,
			"player_turn_phase" => 11,
			"attacking_player_id" => 12,
			"defending_player_id" => 13,
			"battling_province_id" => 14,
			"last_battle_winner" => 15,
			"last_battle_loser" => 16,
			"attacker_battle_swaps" => 17,
			"defender_battle_swaps" => 18,
			"active_player_id" => 19,
			"placing_citadels" => 20,
			"village_captures_available" => 21,
        ) ); 
		
		//create the tile decks for each faction
		$this->faction_decks = array();
		for($factionid=0; $factionid<6; $factionid++)
		{
			//create the deck
			$this->faction_decks[$factionid] = self::getNew("module.common.deck");
			$this->faction_decks[$factionid]->init("tiles_faction" . $factionid);
			$this->faction_decks[$factionid]->autoreshuffle = true;		//todo:  UI notify the player their discard has been shuffled in
			$this->faction_decks[$factionid]->autoreshuffle_trigger = array('obj' => $this, 'method' => 'OnDeckAutoshuffle');
			$this->faction_decks[$factionid]->autoreshuffle_custom = array('bag' => 'discard');
		}
		
		//factions wont have been fully assigned yet in the faction select screen
		$this->LinkPlayersToFactionDecksIfPossible();
		
		//create the battle tiles
		$this->attacker_dice_deck = self::getNew("module.common.deck");
		$this->attacker_dice_deck->init("battle_tiles_attacker");
		$this->defender_dice_deck = self::getNew("module.common.deck");
		$this->defender_dice_deck->init("battle_tiles_defender");
		
		//create the village deck
		$this->villages_deck = self::getNew("module.common.deck");
		$this->villages_deck->init("villages");
		
		$this->debug_skip_faction_assignment = false;
	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "bloodstones";
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
		$result = array();
		
		/*
		//note: loadPlayersBasicInfos() returns the generic columns from the players table indexed by player id
		//its contents are potentially useful:
		* player_name - the name of the player
		* player_color (ex: ff0000) - the color code of the player
		* player_no - the position of the player at the start of the game in natural table order, i.e. 1,2,3
		*/
		
		//general meta info about the game
		$result["player_turn_phase"] = self::getGameStateValue("player_turn_phase");
		
		// Get public information about players
		// Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
		$sql_players = "SELECT player_id id, player_score score, player_factionid factionid, player_regroups regroups, player_citadel_prov citadel_prov_id, captured_citadels, player_freebuildpoints freebuildpoints FROM player ";
		$result['players'] = self::getCollectionFromDb($sql_players);
		
		//calculate some useful info about the player hands here
		foreach($result['players'] as $player_id => &$player)
		{
			//have the player decks been assigned? requires factions to be finalised
			if($this->ArePlayerDecksLinked())
			{
				$player_deck = $this->player_decks[$player_id];
				
				//info about cards relevant to this player
				if($player_deck)
				{
					$player["tiles_hand"] = $player_deck->countCardInLocation("hand");
					$player["tiles_bag"] = $player_deck->countCardInLocation("bag");
					$player["tiles_discard"] = $player_deck->countCardInLocation("discard");
				}
				
				//detailed citadel info
				$player["citadel_prov_id"] = (int)$player["citadel_prov_id"];
				if($player["citadel_prov_id"] >= 0)
				{
					$player["citadel_tile_info"] = $this->GetPlayerCitadelTile($player_id);
				}
				else
				{
					$player["citadel_tile_info"] = null;
				}
			}
			
			//info about villages relevant to this player
			$player["villages_built"] = $this->getPlayerVillagesBuiltInfos($player_id);
			$player['villages_available'] = $this->countPlayerVillagesAvailable($player_id);
			$player['villages_captured'] = $this->countPlayerVillagesCaptured($player_id);
		}
		
		$result["all_provinces"] = $this->getAllProvinces();
		
		if($this->ArePlayerDecksLinked() && !$this->isSpectator())
		{
			$current_player_id = self::getCurrentPlayerId();
			$current_player_deck = $this->player_decks[$current_player_id];
			$result['hand'] = $current_player_deck->getCardsInLocation('hand');
		}
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($this->player_decks, true)));
		
		//some useful functions
		/*
		getDoubleKeyCollectionFromDB( $sql, $bSingleValue=false )
			Return an associative array of associative array, from a SQL SELECT query.
			First array level correspond to first column specified in SQL query.
			Second array level correspond to second column specified in SQL query.
			If bSingleValue = true, keep only third column on result

		self::getCollectionFromDB( "SELECT player_id id, player_name name, player_score score FROM player" );
			Result:
			array(
			 1234 => array( 'id'=>1234, 'name'=>'myuser0', 'score'=>1 ),
			 1235 => array( 'id'=>1235, 'name'=>'myuser1', 'score'=>0 )
			)
		*/
		
		//get info on the armies on the board
		//todo: this seems more intricate than it needs to be. i wonder if there's a simpler way to do this? 
		$armies = $this->GetAllArmies();
		$armies_by_id_string = [];
		foreach($armies as $army_id_string => &$army)
		{
			//first, get the tile deck for this player's army
			$army_player_deck = $this->player_decks[$army["player_id"]];
			
			//now grab the tiles in this army
			$army["tiles"] = $army_player_deck->getCardsInLocation('army', $army["army_id"]);
			
			//link the army id
			$armies[$army_id_string] = $army;
			
			//army_id_num now matches the province id num
			//and each player only has 1 standard army per province
			//use this constructed string from GetArmyIdString() to prevent id collisions
			$army_string_id = $this->GetArmyIdString($army);
			$armies_by_id_string[$army_string_id] = $army;
		}
		
		//save the final creation
		$result['armies'] = $armies;
		$result['armies_by_id_string'] = $armies_by_id_string;
		
		//is a battle in progress?
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		
		//attacking and defender player id will be 0 if there is no ongoing battle
		if($attacking_player_id > 0)
		{
			//pass on info about the currently ongoing battle
			$result['attacking_player_id'] = $attacking_player_id;
			
			$defending_player_id = $this->getGameStateValue("defending_player_id");
			$result['defending_player_id'] = $defending_player_id;
			
			$battling_province_name = $this->getProvinceName($this->getGameStateValue("battling_province_id"));
			$result['battling_province_name'] = $battling_province_name;
		}
		else
		{
			$result['attacking_player_id'] = -1;
			$result['defending_player_id'] = -1;
			$result['battling_province_name'] = null;
		}
		
		//get any battles that are pending
		$result['pending_battles'] = $this->GetPendingBattleProvincesAll($attacking_player_id);
		
		//make sure the client knows there is only 1 capture action per player per turn
		$result['village_captures_available'] = $this->getGameStateValue("village_captures_available");
		
		//for testing
		$active_player_id = self::getActivePlayerId();
		//$result["pending_capture_armies"] = $this->GetPendingCaptureArmies($active_player_id);
		$result["pending_capture_armies_all"] = $this->GetPendingCaptureArmiesAll();
		
		//pass this onto the client interface as a bunch of nested associative arrays
		//js is really nice and flexible that way
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // compute and return the game progression
		//the game completes when each player has carried out the maximum number of regroups
		$total_regroups = $this->getRegroupsSum();
		$max_regroups = $this->getRegroupsMax();
		
		$progression = 100 * ($total_regroups / $max_regroups);
		
        return floor($progression);
    }
	
	function isGameFinished()
	{
		return ($this->getRegroupsSum() >= $this->getRegroupsMax());
	}
	

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */
	
	function isCurrentPlayerActive()
	{
		return self::getCurrentPlayerId() == self::getActivePlayerId();
	}
	
	public function getStateName()
	{
		$state = $this->gamestate->state();
		return $state['name'];
	}

//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in bloodstones.action.php)
    */

    /*
    
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */
	
	function tryNextPhase($player_id)
	{
		//todo: this function is probably redundant. i just have to decide how to best encapsulate the ui flow
		self::checkAction("action_tryNextPhase");
		
		//what is the current player phase?
		$current_phase_id = self::getGameStateValue("player_turn_phase");
		//$current_player_id = $this->getCurrentPlayerId();
		$current_player = self::getObjectFromDB("SELECT player_id id, player_factionid factionid FROM player WHERE player_id='$player_id'");
		
		//this.player_phases_all = ["villages","undead","main","build","move","battle"];
		$ending_turn = false;
		switch($current_phase_id)
		{
			case(0):
			{
				//0 = capture villages phase
				if($current_player["factionid"] == 4)
				{
					//necromancers have their unique undead phase they go to next
					$this->enterPhase(1);
				}
				else
				{
					$this->enterPhase(2);
				}
				break;
			}
			case(1):
			{
				//1 = necromancer faction undead move phase
				$this->enterPhase(2);
				break;
			}
			case(2):
			{
				//2 = main phase
				//exiting this phase will end the player turn
				$this->playerEndTurn();
				$ending_turn = true;
				break;
			}
			case(3):
			{
				//3 = build phase
				$this->enterPhase(2);
				break;
			}
			case(4):
			{
				//4 = move phase
				$this->enterPhase(2);
				break;
			}
			case(5):
			{
				//5 = battle phase
				$this->enterPhase(2);
				break;
			}
			case(6):
			{
				//6 = end phase
				//the player should never be in this state
				ChromePhp::log("server::tryExitCurrentPhase($player_id) ERROR: current_phase_id should not equal 6");
				break;
			}
			default:
			{
				ChromePhp::log("server::tryExitCurrentPhase($player_id) ERROR: unknown current_phase_id: $current_phase_id");
				break;
			}
		}
		/*
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );*/
		
		//if the player is ending turn, that function will send the relevant updates to players
		if($ending_turn != true)
		{
			//todo: is this needed?
			//there needs to be a notifyplayer() call to close the web request or the client will be left hanging
		}
	}
	
	function tryEnterPhase($player_id, $phase_id)
	{
		//note: this function is currently unused
		self::checkAction("action_tryEnterPhase");
		
		//$players = self::getCollectionFromDb("SELECT player_id, player_factionid factionid FROM player");
		$current_player_faction_id = self::getUniqueValueFromDB("SELECT player_factionid FROM player WHERE player_id='$player_id'");
		$success = false;
		$current_phase_id = self::getGameStateValue("player_turn_phase");
		switch($phase_id)
		{
			case(0):
			{
				//silently fail
				//ChromePhp::log("server::tryEnterPhase($player_id) WARNING: player attempted to illegally enter phase $phase_id");
				break;
			}
			case(1):
			{
				if($current_phase_id == 0 && $current_player_faction_id == 4)
				{
					//1 = necromancer faction undead move phase
					$this->enterPhase(1);
					$success = true;
				}
				else
				{
					//silently fail
					//ChromePhp::log("server::tryEnterPhase($player_id) WARNING: player attempted to illegally enter phase $phase_id");
				}
				break;
			}
			case(2):
			{
				//2 = main phase
				if($current_phase_id < 6 && $current_phase_id != 2)
				{
					//todo: check previous phase and do special handling
					//eg for build and move phase the player could get forced to pay or cancel
					$this->enterPhase(2);
					$success = true;
				}
				break;
			}
			case(3):
			{
				//3 = build phase
				//todo: force player to pay or cancel?
				if($current_phase_id == 2)
				{
					$this->enterPhase(3);
					$success = true;
				}
				else if($current_phase_id == 3)
				{
					$this->enterPhase(2);
					$success = true;
				}
				break;
			}
			case(4):
			{
				//4 = move phase
				if($current_phase_id == 2)
				{
					$this->enterPhase(4);
					$success = true;
				}
				else if($current_phase_id == 4)
				{
					$this->enterPhase(2);
					$success = true;
				}
				break;
			}
			case(5):
			{
				//5 = battle phase
				if($current_phase_id == 2)
				{
					$this->enterPhase(5);
					$success = true;
				}
				else if($current_phase_id == 5)
				{
					$this->enterPhase(2);
					$success = true;
				}
				break;
			}
			case(6):
			{
				//6 = end phase
				//this shouldn't be reachable
				//todo: ive got to actually remove the calls from the ui 
				ChromePhp::log("server::tryEnterPhase($player_id) WARNING: player attempted to illegally enter phase $phase_id");
				break;
			}
			default:
			{
				ChromePhp::log("server::tryEnterPhase($player_id) ERROR: unknown phase_id: $phase_id");
				break;
			}
		}
		
		if($success == false)
		{
			//silently notify players so that the web request is closed
			self::notifyAllPlayers("debug", "", array('debugmessage' => "silently failed tryEnterPhase() with phase_id:$phase_id"));
		}
	}
	
	function enterPhase($phase_id)
	{
		//this function is unsafe, make sure you do safety checks before calling it
		self::setGameStateValue("player_turn_phase", $phase_id);
		
		//tell the players about it so the interface can be updated
		self::notifyAllPlayers("changePhase", "", array(
			'new_phase' => $phase_id));
	}
	
	function OnDeckAutoshuffle()
	{
		self::notifyAllPlayers("debug", "", array('debugmessage' => "server::OnDeckAutoshuffle()"));
		$arg_list = func_get_args();
		
		$active_player_id = $this->getActivePlayerId();
		$active_player = self::getObjectFromDB( "SELECT player_id id, player_regroups regroups FROM player WHERE player_id='$active_player_id'" );
		$new_regroups = $active_player["regroups"] + 1;
		self::DbQuery("UPDATE player SET player_regroups='$new_regroups' WHERE player_id='$active_player_id'");
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::OnDeckAutoshuffle() args: " . var_export($arg_list,true)));
		self::notifyAllPlayers("regroup", "", array('player_id' => $active_player_id, 'regroups' => $new_regroups));
		
		//add score from built villages
		$num_villages_built = count($this->getPlayerVillagesBuiltInfos($active_player_id));
		$this->dbIncScore($active_player_id, $num_villages_built);
		$this->incStat($num_villages_built, "villages_built", $active_player_id);
		
		//check for game end here
		if($this->isGameFinished())
		{
			self::notifyAllPlayers("debug", "", array('debugmessage' => "that was the final regroup! The game should now end"));
		}
		else
		{
			self::notifyAllPlayers("debug", "", array('debugmessage' => "the active player is regrouping..."));
		}
	}
	
	function checkActionState($action_name, $bThrowException=true)
	{
		//this function is a variation of self::checkAction("my_action_name")
		//that function will check a) if the current player is active b) if my_action_name is in the list of allowed actions for that state
		//im implementing the option to 'unpass' for certain actions, which means players can go from inactive -> active
		//this function will just check if my_action_name is in the list of allowed actions for the current state 
		$err_msg = null;
		if($this->isSpectator())
		{
			if($bThrowException)
			{
				//todo: mark this string for translations
				//it should never (?) come up so its not a high priority
				throw new BgaSystemException("Warning! Spectators are not allowed to do: $action_name");
			}
			else
			{
				return false;
			}
		}
		
		if(!$this->gamestate->checkPossibleAction($action_name))
		{
			if($bThrowException)
			{
				//todo: mark this string for translations
				throw new BgaSystemException("Warning! $action_name is not allowed in the current game state");
			}
			else
			{
				return false;
			}
		}
		
		if($bThrowException)
		{
			return true;
		}
	}
	
	
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */
	
	//this example shows how to send private info to a player using the state arg function 
	/*
    function argPlayerTurn()  {
        $specific_player_id = ...; // calculate some-how
        return array(
            '_private' => array(   // all data inside this array will be private
                $specific_player_id => array(   // will be sent only to that player   
                    'somePrivateData' => self::getSomePrivateData()   
                )
            ),

            'possibleMoves' => self::getPossibleMoves()   // will be sent to all players
        );
    }
	*/
	
	function args_citadelPlacement()
	{
		//this function is getting called by action_playerPlaceCitadel and i don't know why
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::args_citadelPlacement()"));
		$active_player_id = $this->getActivePlayerId();
		$args = array(
			"possible_citadel_provinces" => $this->GetPossibleCitadelProvinces($active_player_id)
		);
		
		return $args;
	}
	
	function args_freeBuild()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::args_freeBuild()"));
		$players = self::getCollectionFromDb("SELECT player_id, player_citadel_prov FROM player ");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($players,true)));
		$buildable_provs = [];
		foreach($players as $player_id => $player)
		{
			//$citadel_prov_id = $player["player_citadel_prov"];
			//$buildable_provs = array_merge([$citadel_prov_id], $this->GetAdjSeaProvIds($citadel_prov_id));
			$buildable_provs[$player_id] = $this->GetPlayerBuildableProvinces($player_id);
		}
		
		$args = array(
			"buildable_provinces" => $buildable_provs
		);
		return $args;
	}
	
	function args_freeBuild_chaosHorde()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::args_freeBuild_chaosHorde()"));
		//todo: get the buildable provinces for chaos horde starting army (everywhere at least 2 tiles away from a citadel)
		$players = self::getCollectionFromDb("SELECT player_id, player_factionid FROM player ");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($players,true)));
		$player_id = $this->getActivePlayerId();
		$buildable_provs[$player_id] = $this->GetPossibleCitadelProvinces($player_id, false);
		
		$args = array(
			"buildable_provinces" => $buildable_provs
		);
		
		return $args;
	}
	
	function args_initNewGame()
	{
		$args = [];
		$args["players"] = self::getCollectionFromDb("SELECT player_id, player_factionid FROM player ");
		
		//updte this value
		//i could default this on the client to starting at '20' but that could introduce subtle client misinfo down the line
		foreach($args['players'] as $player_id => &$player)
		{
			$player['villages_available'] = $this->countPlayerVillagesAvailable($player_id);
		}
		return $args;
	}
	
	function args_playerCapture()
	{
		$active_player_id = $this->getActivePlayerId();
		$args = array(
			"possible_capture_infos" => $this->GetPendingCaptureArmies($active_player_id)
		);
		
		return $args;
	}
	
	function args_playermain()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::args_playermain()"));
		$active_player_id = $this->getActivePlayerId();
		$args = array(
			"buildable_provinces" => $this->GetPlayerBuildableProvinces($active_player_id)
		);
		
		if($this->IsPlayerChaosHorde($active_player_id))
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::args_playermain() active_player_id is chaos horde"));
			$args["possible_capture_infos"] = $this->GetPendingCaptureArmies($active_player_id);
		}
		else
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::args_playermain() active_player_id is NOT chaos horde"));
		}
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($args, true)));
		return $args;
	}
	
	function args_battle()
	{
		$args = array(
			"battling_province_name" => $this->getProvinceName($this->getGameStateValue("battling_province_id")),
			"attacking_player_id" => $this->getGameStateValue("attacking_player_id"),
			"defending_player_id" => $this->getGameStateValue("defending_player_id"),
		);
		
		return $args;
	}
	
	function args_chooseWithdraw()
	{
		$args = $this->args_battle();
		
		$battling_province_id = $this->getGameStateValue("battling_province_id");
		$defending_player_id = $args["defending_player_id"];
		
		$retreat_prov_options = $this->GetProvinceRetreatOptions($battling_province_id, $defending_player_id);
		$args['retreat_prov_options'] = $retreat_prov_options;
		
		return $args;
	}
	
	function args_battleTile()
	{
		$args = $this->args_battle();
		
		//grab all the info we need
		$attacking_player_id = $args["attacking_player_id"];
		$defending_player_id = $args["defending_player_id"];
		$attacker_tiles = $this->attacker_dice_deck->getCardsInLocation("battle");
		$defender_tiles = $this->defender_dice_deck->getCardsInLocation("battle");
		$attacker_tiles_rejected = $this->attacker_dice_deck->getCardsInLocation("reject");
		$defender_tiles_rejected = $this->defender_dice_deck->getCardsInLocation("reject");
		$attacker_tiles_swapped = $this->player_decks[$attacking_player_id]->getCardsInLocation("battle");
		$defender_tiles_swapped = $this->player_decks[$defending_player_id]->getCardsInLocation("battle");
		$player_id = $this->getCurrentPlayerId();
		$args["current_player_id"] = $player_id;
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::args_battleTile() player_id:$player_id, attacking_player_id:$attacking_player_id, defending_player_id:$defending_player_id"));
		
		//compiled tile info for the attacker
		$attacking_player_info = array(
			'attacker_tiles' => $attacker_tiles,
			'attacker_tiles_swapped' => $attacker_tiles_swapped,
			'attacker_tiles_rejected' => $attacker_tiles_rejected
		);
		
		//compiled tile info for the defender
		$defending_player_info = array(
			'defender_tiles' => $defender_tiles,
			'defender_tiles_swapped' => $defender_tiles_swapped,
			'defender_tiles_rejected' => $defender_tiles_rejected
		);
		
		//generic info
		$args = array_merge($args, array(
			'num_attacker_tiles' => count($attacker_tiles),
			'num_defender_tiles' => count($defender_tiles),
			'num_attacker_tiles_swapped' => count($attacker_tiles_swapped),
			'num_defender_tiles_swapped' => count($defender_tiles_swapped),
			'num_attacker_tiles_rejected' => count($attacker_tiles_rejected),
			'num_defender_tiles_rejected' => count($defender_tiles_rejected),
		));
		
		$state_name = $this->getStateName();
		if($state_name == "battleEnd" || $state_name == "retreat")
		{
			//reveal the tiles to everyone
			$args['battle_tile_info'] = array_merge($attacking_player_info, $defending_player_info);
		}
		//else
		{
			//attacker and defender can see their own tiles
			$args['_private'][$attacking_player_id] = $attacking_player_info;
			$args['_private'][$defending_player_id] = $defending_player_info;
			
			//special rule for corsair can spy on enemy player tiles
			$corsair_player_id = $this->GetCorsairPlayer();
			if($corsair_player_id != null)
			{
				//let them see both attacker and defender tiles
				$args['_private'][$corsair_player_id] = array_merge($attacking_player_info, $defending_player_info);
			}
		}
		
		return $args;
	}
	
	function args_battleEnd()
	{
		$args = $this->args_battleTile();
		$winning_player_id = $this->getGameStateValue("last_battle_winner");
		$args['winner_name'] = $this->getPlayerFactionName($winning_player_id);
		$args['winning_player_id'] = $winning_player_id;
		$args['winning_player_score'] = $this->dbGetScore($winning_player_id);
		
		return $args;
	}
	
	function args_retreat()
	{
		$args = $this->args_battle();
		
		$battling_province_id = $this->getGameStateValue("battling_province_id");
		$losing_player = $this->getLastBattleLoser();
		
		$retreat_prov_options = $this->GetProvinceRetreatOptions($battling_province_id, $losing_player);
		$args['retreat_prov_options'] = $retreat_prov_options;
		
		//some helpful info about the retreating army
		$battling_province_name = $this->getProvinceName($battling_province_id);
		$retreating_army = $this->GetMainPlayerArmyInProvinceFromProvName($losing_player, $battling_province_name);
		$retreating_army_id_string = $retreating_army["army_id_string"];
		$args['retreating_army_id_string'] = $retreating_army_id_string;
		
		return $args;
	}
	
	function args_playerVillages()
	{
		$args = [];
		
		$active_player_id = self::getActivePlayerId();
		$args["possible_village_provinces"] = $this->GetPossibleVillageProvinces($active_player_id);
		
		return $args;
	}
	
	
//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    /*
    
    Example for game state "MyGameState":

    function stMyGameState()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }    
    */
	
	function st_factionSelect_init()
	{
		if($this->debug_skip_faction_assignment)
		{
			//for debugging we need this because we will be skipping a few other steps
			$this->AssignRandomPlayerFactions();
			$this->InitNewGame();
			$this->AssignRandomPlayerCitadels();
			//$this->gamestate->nextState('freeBuild');
			$this->gamestate->nextState('freeBuild_finish');
		}
		else
		{
			$this->gamestate->nextState('factionSelect');
		}
	}
	
	function st_factionselect()
	{
		//players can simultaneously make choices
		$this->gamestate->setAllPlayersMultiactive();
    }
	
	function st_initNewGame()
	{
		//complete initialisation of players now that factions have been assigned
		$this->InitNewGame();
		
		//citadel placement is in reverse order, so get the last player
		$first_player_id = $this->getNextPlayerTable()[0];
		$last_player_id = $this->getPrevPlayerTable()[$first_player_id];
		
		//chaos horde dont place a citadel so skip them if they would be first
		if($this->GetChaosHordePlayer() == $last_player_id)
		{
			$last_player_id = $this->getPrevPlayerTable()[$last_player_id];
		}
		
		//then activate the last player to place their citadel first
		$this->gamestate->changeActivePlayer($last_player_id);
		
		//go to the citadel placement state
		$this->gamestate->nextState('citadelPlacement');
	}
	
	function st_nextCitadel()
	{
		//citadel placement works in reverse of the natural player order
		
		$this->activePrevPlayer();
		$active_player_id = $this->getActivePlayerId();
		
		//chaos horde do not place a citadel so we can just skip them
		if($this->getPlayerFactionId($active_player_id) == self::FACTION_CHAOSHORDE)
		{
			$this->activePrevPlayer();
			$active_player_id = $this->getActivePlayerId();
		}
		
		//has this player placed a citadel yet?
		$citadel_prov_id = $this->getUniqueValueFromDB("SELECT player_citadel_prov FROM player WHERE player_id='$active_player_id'");
		if($citadel_prov_id == -1)
		{
			$this->gamestate->nextState('citadelPlacement');
		}
		else
		{
			//citadel placement is done so now players can place their starting units
			$this->gamestate->nextState('freeBuild');
		}
	}
	
	function st_freeBuild()
	{
		//players can simultaneously make choices
		$players = self::getCollectionFromDB( "SELECT player_id, player_factionid FROM player" );
		$player_ids = [];
		foreach($players as $player_id => $player)
		{
			//dont set the chaoshorde active here, they will do their freebuild after all other players
			if($player["player_factionid"] != self::FACTION_CHAOSHORDE)
			{
				$player_ids[] = $player_id;
			}
		}
		$this->gamestate->setPlayersMultiactive($player_ids, null, true);
	}
	
	function st_freeBuild_chaosHorde_setup()
	{
		//first, work out if we have a chaos horde player
		$players = self::getCollectionFromDB("SELECT player_id, player_factionid FROM player");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($players, true)));
		$success = false;
		foreach($players as $player_id => $player)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($player, true)));
			$faction_id = $this->GetPlayerFaction($player_id);
			if($player["player_factionid"] == self::FACTION_CHAOSHORDE)
			{
				$multiactive_players = [$player_id];
				$success = true;
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::st_freeBuild_chaosHorde_setup() player $player_id is chaos horde, starting chaos horde freebuild mode..."));
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($multiactive_players, true)));
				//$this->gamestate->setPlayersMultiactive($multiactive_players, null, true);
				$this->gamestate->changeActivePlayer($player_id);
				$this->gamestate->nextState('freeBuild_chaosHorde');
				break;
			}
		}
		
		if(!$success)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::st_freeBuild_chaosHorde_setup() no chaos horde players found, finishing freebuild"));
			$this->gamestate->nextState('freeBuild_finish');
		}
	}
	
	function st_freeBuild_finish()
	{
		//redraw up to the maximum hand size for all players
		$this->setupInitialPlayerHands();
		$this->gamestate->nextState('nextPlayer');
	}
	
    function st_nextPlayer()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::st_nextPlayer()"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($this->getNextPlayerTable(),true)));
		$old_active_player_id = $this->getActivePlayerId();
		
		$this->activeNextPlayer();
		$active_player_id = $this->getActivePlayerId();
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "active_player_id:$active_player_id"));
		//$next_player_id = $this->getNextPlayerTable()[$active_player_id];
		
		//has a full round of player turns passed?
		$prev_player_turns = $this->getStat("turns_number", $old_active_player_id);
		$active_player_turns = $this->getStat("turns_number", $active_player_id);
		if($prev_player_turns == $prev_player_turns)
		{
			//increase the number of game rounds
			$this->incStat(1, "turns_number");
		}
		
		//increase the number of turns this player has taken
		//todo: the current player turn number is already stored as a global variable, it doesnt need to be a game stat
		$this->incStat(1, "turns_number", $active_player_id);
		
		//reset the capture action counter... there is 1 capture action per player per turn
		$this->setGameStateValue("village_captures_available", 1);
		
		//reset the turn timer for the player that just had their turn
		if($old_active_player_id)
		{
			$this->giveExtraTime($old_active_player_id);
		}
		
		//$this->enterPhase(2);	//todo: i think this is obsolete and can be removed
		
		//what is the next game state that this player will go to?
		$next_state = null;
		
		//todo: check if the player has been wiped out
		//they get to place a free village
		
		//which phase will this player start in? villages -> undead -> main
		//skip any actions the player is unable to do
		
		//is it time to end the game?
		if($this->isGameFinished())
		{
			//this will happen at some point during OnDeckAutoshuffle()
			//todo
			
			//1. resolve all battles
			//2. active player redraws hand
			//3. all players may capture villages
			
			//for now just finish the game
			$next_state = STATE_GAMEOVER;
		}
		
		else if($this->GetPendingCaptureArmies($active_player_id, true) && !$this->IsPlayerChaosHorde($active_player_id))
		{
			//first priority: can this player capture villages?
			//chaos horde can only capture villages during their main phase
			$next_state = STATE_PLAYERCAPTURE;
		}
		else if($this->CanPlayerUndeadPhase($active_player_id))
		{
			//second priority: can this player can move any undead
			$next_state = STATE_PLAYERUNDEAD;
		}
		else
		{
			//third priority: go directly to main phase
			$next_state = STATE_PLAYERMAIN;
		}
		
		//what was our outcome for the starting phase?
		switch($next_state)
		{
			case STATE_PLAYERCAPTURE:
			{
				$this->gamestate->nextState('playerCapture');
				break;
			}
			case STATE_PLAYERUNDEAD:
			{
				$this->gamestate->nextState('playerUndead');
				break;
			}
			case STATE_PLAYERMAIN:
			{
				$this->gamestate->nextState('playerMain');
				break;
			}
			case STATE_GAMEOVER:
			{
				$this->gamestate->nextState('gameOver');
				break;
			}
		}
		
		//tell the players that it is now the next player's turn
		self::notifyAllPlayers("startTurn", clienttranslate( 'It is now ${player_name}\'s turn' ), array('player_name' => $this->getActivePlayerName()
		));
	}
	
	function st_setupWithdraw()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::st_setupWithdraw()"));
		
		//some useful info
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		//$battling_province_name = "prov" . $this->getGameStateValue("battling_province_id");
		
		$this->incStat(1, "battles_attack", $attacking_player_id);
		
		//logic: determine if withdraw is possible
		$withdraw_status = $this->calculateWithdrawStatus();
		
		//wrap this in a function to handle the translation
		$this->SendWithdrawPlayerNotification($withdraw_status);
		
		//logic: assign defending player as active if withdraw is possible
		if($this->isWithdrawAllowed($withdraw_status))
		{
			$this->gamestate->changeActivePlayer($defending_player_id);
			$this->gamestate->nextState('chooseWithdraw');
		}
		else
		{
			$this->gamestate->nextState('setupBattle');
		}
	}
	
	function st_chooseWithdraw()
	{
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		$this->incStat(1, "battles_withdraw", $defending_player_id);
	}
	
	function st_setupBattle()
	{
		self::notifyAllPlayers("debug", "", array('debugmessage' => "server::st_setupBattle()"));
		
		//draw the player's "dice" tiles for this battle
		$this->drawDice();
		
		$corsair_player_id = $this->GetCorsairPlayer();
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		if($corsair_player_id && ($corsair_player_id == $attacking_player_id || $corsair_player_id == $defending_player_id))
		{
			$other_player_id;
			if($attacking_player_id == $corsair_player_id)
			{
				$other_player_id = $defending_player_id;
			}
			else
			{
				$other_player_id = $attacking_player_id;
			}
			$other_faction_name = $this->getPlayerFactionName($other_player_id);
			self::notifyAllPlayers("showMessage", clienttranslate('Corsairs have spied on ${other_faction_name} battle tiles.'), array('type' => "info", 'other_faction_name' => $other_faction_name));
		}
		
		$this->incStat(1, "battles_defend", $defending_player_id);
		
		//decide who will go first
		$this->gamestate->nextState("nextBattleTile");
	}
	
	function st_nextBattleTile()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::st_nextBattleTile()"));
		
		//some useful info
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		
		//figure out who is next to swap their tile
		$next_swap_player = $this->getNextSwapPlayer($attacking_player_id, $defending_player_id);
		
		//go to them
		if($next_swap_player != 0)
		{
			$this->gamestate->changeActivePlayer($next_swap_player);
			$this->gamestate->nextState('battleTile');
		}
		else
		{
			$this->gamestate->nextState('battleResolve');
		}
	}
	
	function st_battleResolve()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::st_battleResolve()"));
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		
		$winning_player = $this->getBattleWinner();
		if($winning_player != 0)
		{
			//a clear winner
			$this->setGameStateValue("last_battle_winner", $winning_player);
			$losing_player = $attacking_player_id;
			if($winning_player == $attacking_player_id)
			{
				$losing_player = $defending_player_id;
			}
			$this->setGameStateValue("last_battle_loser", $losing_player);
			
			//merge together all the loser armies so they can retreat
			//todo: armies on the client arent properly merging and retreating together
			$battling_province_id = $this->getGameStateValue("battling_province_id");
			$loser_army = $this->MergePlayerArmiesInProvince($battling_province_id, $losing_player);
			
			$this->incStat(1, "battles_won", $winning_player);
			$this->incStat(1, "battles_lost", $losing_player);
			
			//the winner gets awarded VP equal to the number of tiles in the losing army
			$loser_deck = $this->player_decks[$losing_player];
			$loser_tiles = $loser_deck->getCardsInLocation("army", $loser_army["army_id"]);
			
			//function dbIncScore($player_id, $inc)
			$victory_vp = count($loser_tiles);
			
			//corsair player gets 1 bonus VP from winning battles
			if($this->IsPlayerCorsair($winning_player))
			{
				$victory_vp += 1;
			}
			
			//update the database
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "victory_vp: $victory_vp"));
			$this->dbIncScore($winning_player, $victory_vp, false);
			$this->incStat($victory_vp, "vp_battles", $winning_player);
			
			//tell the clients
			self::notifyAllPlayers("battleResolve", clienttranslate('${player_name1} has defeated ${player_name2} in battle, gaining ${victory_vp} victory points.'), array(
				'player_name1' => $this->getLastBattleWinnerPlayerName(),
				'player_name2' => $this->getLastBattleLoserPlayerName(),
				'losing_player_id' => $losing_player,
				'loser_army_id' => $loser_army["army_id"],
				'victory_vp' => $victory_vp
				));
			
			//go to the battleEnd state to handle retreating
			$this->gamestate->changeActivePlayer($losing_player);
			$this->gamestate->nextState('battleEnd');
		}
		else
		{
			//a tie
			//go back to the dice draw step
			$this->resetAfterTie();
			
			//tell the players what is happening
			self::notifyAllPlayers("showMessage", clienttranslate("This round of battle was a draw. Starting the next round..."), []);
			
			//go back to the dice draw step, but after withdrawals
			$this->gamestate->nextState('setupBattle');
		}
	}
	
	function st_battleCleanup()
	{
		//reset the attacker dice tiles
		$this->attacker_dice_deck->moveAllCardsInLocation("battle","deck");
		$this->attacker_dice_deck->moveAllCardsInLocation("reject","deck");
		
		//reset the defender dice tiles
		$this->defender_dice_deck->moveAllCardsInLocation("battle","deck");
		$this->defender_dice_deck->moveAllCardsInLocation("reject","deck");
		
		//discard any tiles the player used for a battle score boost
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$this->player_decks[$attacking_player_id]->moveAllCardsInLocation("battle","discard");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		$this->player_decks[$defending_player_id]->moveAllCardsInLocation("battle","discard");
		
		//later, the attacking player will return to their main turn
		//the attacking player can only ever be the main player (from the game rules)
		$this->gamestate->changeActivePlayer($attacking_player_id);
		
		//finally reset these global variables
		self::setGameStateValue("attacking_player_id", 0);
		self::setGameStateValue("defending_player_id", 0);
		self::setGameStateValue("battling_province_id", 0);
		self::setGameStateValue("last_battle_winner", 0);
		self::setGameStateValue("attacker_battle_swaps", 0);
		self::setGameStateValue("defender_battle_swaps", 0);
		
		//let the original player continue with their main phase
		$this->gamestate->nextState('playerMain');
	}
	
	function st_gameOver()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::st_gameOver()"));
		
		//most of this function is to calculate the winner for game stats purposes
		//the BGA framework does a separate calculation of the winner which makes this code possibly redundant
		
		//add extra score from captured villages, and calculate the tiebreaker scores using 'player_score_aux'
		$this->CalculateFinalPlayerScores();
		
		$players = self::getCollectionFromDb("SELECT player_id, player_score, player_score_aux FROM player ");
		$winning_player_id = -1;
		$winning_player_score = -1;
		
		//calculate the winner
		foreach($players as $player_id => $player)
		{
			$player_score = $player["player_score"];
			if($player_score > $winning_player_score)
			{
				$winning_player_id = $player_id;
				$winning_player_score = $player_score;
			}
		}
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "winning player id after first pass is $winning_player_id"));
		
		//check for ties
		$tied_players = [];
		foreach($players as $player_id => $player)
		{
			$player_score = $player["player_score"];
			if($player_score == $winning_player_score)
			{
				$tied_players[] = $player_id;
			}
		}
		
		//is there a tie?
		$num_ties = count($tied_players);
		if($num_ties > 1)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "tied players detected: $num_ties"));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tied_players,true)));
			
			//resolve the tie
			foreach($tied_players as $player_id)
			{
				$tie_player_score = $player["player_score"] + $player["player_score_aux"];
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "player_id:$player_id tie_player_score:$tie_player_score"));
				if($tie_player_score > $winning_player_score)
				{
					$winning_player_id = $player_id;
					$winning_player_score = $tie_player_score;
				}
			}
		}
		
		//final check for tied players
		$tied_players = [];
		foreach($players as $player_id => $player)
		{
			$tie_player_score = $player["player_score"] + $player["player_score_aux"];
			if($tie_player_score == $winning_player_score)
			{
				$tied_players[] = $player_id;
			}
		}
		
		$num_ties = count($tied_players);
		if($num_ties == 1)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "final winning player:$winning_player_id"));
			self::notifyAllPlayers("showMessage", clienttranslate('Game over. ${player_name} has won.'), array(
				'type' => "info",
				'player_id' => $winning_player_id,
				'player_name' => $this->getPlayerNameById($winning_player_id),
				));
			
			$winning_faction = $this->GetPlayerFaction($winning_player_id);
			$this->setStat($winning_faction, "winning_faction");
		}
		else if($num_ties == 2)
		{
			$args = ['type' => 'info'];
			$args['player_id1'] = $tied_players[0];
			$args['player_name1'] = $this->getPlayerNameById($tied_players[0]);
			$args['player_id2'] = $tied_players[1];
			$args['player_name2'] = $this->getPlayerNameById($tied_players[1]);
			self::notifyAllPlayers("showMessage", clienttranslate('The following players have tied for first place: ${player_name1}, ${player_name2}'), $args);
		}
		else
		{
			//showing a nice custom string with all the tied player names is tricky to do programmatically, so i will take a shortcut here
			$args = ['type' => 'info'];
			self::notifyAllPlayers("showMessage", clienttranslate('Multiple players have tied for first place!'), $args);
			/*
			$args = ['type' => 'info'];
			$player_index = 0;
			foreach($tied_players as $player_id)
			{
				$player_name = $this->getPlayerNameById($player_id);
				
				$player_name_var = "player_name$player_index";
				$player_id_var = "player_id$player_index";
				$args[$player_name_var] = $player_name;
				$args[$player_id_var] = $player_id;
				
				$player_index = $player_index + 1;
			}
			self::notifyAllPlayers("showMessage", clienttranslate('The following players have tied for first place: ${tied_player_names}'), $args);
			*/
		}
		
		//end the game
		$this->gamestate->nextState('gameEnd');
	}
	
//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
		
		self::notifyAllPlayers("debug", "", array('debugmessage' => "server::zombieTurn($statename, $active_player)"));
		self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($state, true)));
		
    	/*
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }
		*/
		
		//ive checked all the cases and this is safe
		//the exception is all the battle states... those need addressing
		$this->playerSkipAction($active_player);
		return;
		
        //throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
