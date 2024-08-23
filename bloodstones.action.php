<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * bloodstones implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * bloodstones.action.php
 *
 * bloodstones main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "actMyAction" here, then you can call it from your javascript code with:
 * this.bgaPerformAction("actMyAction", ...)
 *
 */
declare(strict_types=1);

/**
 * @property bloodstones $game
 */
class action_bloodstones extends APP_GameAction
{
    /**
     * This is the constructor. Do not try to implement a `__construct` to bypass this method.
     */
    public function __default()
    {
        if ($this->isArg("notifwindow"))
        {
            $this->view = "common_notifwindow";
            $this->viewArgs["table"] = $this->getArg("table", AT_posint, true);
        }
        else
        {
            $this->view = "bloodstones_bloodstones";
            $this->trace("Complete re-initialization of board game.");
        }
    }

	//this helper function sourced from bga wiki to safety check stringified JSON arrays passed in from the front end
	public function validateJSonAlphaNum($value, $argName = 'unknown')
	{
		//have we been passed in a nice array?
		if (is_array($value))
		{
			foreach ($value as $key => $v)
			{
				//recursively check each key and value
				$this->validateJSonAlphaNum($key, $argName);
				$this->validateJSonAlphaNum($v, $argName);
			}
			return true;
		}
		
		//integers are automatically safe
		if (is_int($value))
		{
			return true;
		}
		
		//assume our input is a JSON stringified string which could contain something nasty
		//do a pattern regular expression match to find nasty characters
		$bValid = preg_match("/^[_0-9a-zA-Z- ]*$/", $value) === 1;
		if (!$bValid)
		{
			throw new BgaSystemException("Bad value for: $argName", true, true, FEX_bad_input_argument);
		}
		return true;
	}
	
	public function action_skip()
	{
		self::setAjaxMode();
		
		$this->game->playerSkipAction();
		
		self::ajaxResponse();
	}
	
	public function action_spawnBattle()
	{
		self::setAjaxMode();
		
		$this->game->spawnBattle();
		
		self::ajaxResponse();
	}
	
	public function action_findBattle()
	{
		self::setAjaxMode();
		
		$this->game->findBattle();
		
		self::ajaxResponse();
	}
	
	public function action_earlyEndTurn()
	{
		self::setAjaxMode();
		
		$this->game->playerEndTurn();
		
		self::ajaxResponse();
	}
	
	public function action_playerSpawnTestArmy()
	{
		self::setAjaxMode();
		
		$this->game->playerSpawnTestArmy();
		
		self::ajaxResponse();
	}
	
	public function action_playerCycleHand()
	{
		self::setAjaxMode();
		
		$this->game->playerCycleHand();
		
		self::ajaxResponse();
	}
	
	public function action_tryArmyStackMove()
	{
		self::setAjaxMode();
		//this player action is unused and mostly disabled
		//however im leaving it here just in case i missed disabling a function call somewhere
		self::notifyAllPlayers("debug", "", array('debugmessage' => "WARNING: action_tryArmyStackMove() called but it shouldn't be"));
		
		//grab the passed in arguments
		$army_id = self::getArg("source_army_id", AT_int, true);
		$provinces_JSON_stringified = self::getArg("provinces_array", AT_json, true);
		
		//ChromePhp::log("server::action_tryArmyStackMove() $army_id");
		
		//after significant screwing around, i have figured out how to pass a json object from javascript -> php 
		//apparently by the time it reaches this function, it has already been converted back to a useable array
		//therefore json_decode() is redundant
		//$provinces_array = json_decode($provinces_JSON_stringified);
		
		//safety check on the JSON we got from the webpage
		$this->validateJSonAlphaNum($provinces_JSON_stringified, "provinces_JSON_stringified");
		
		//all good so we pass it on to the game logic
		//$this->game->ArmyStackMove($army_id, $provinces_JSON_stringified);
		
		self::ajaxResponse();
	}
	
	public function action_tryArmyStackSplit()
	{
		self::setAjaxMode();
		
		//grab the passed in arguments
		$source_army_id = self::getArg("source_army_id", AT_int, true);
		$tile_ids_JSON_stringified = self::getArg("splitting_tiles", AT_json, true);
		
		//safety check on the JSON we got from the webpage
		$this->validateJSonAlphaNum($tile_ids_JSON_stringified, "tile_ids_JSON_stringified");
		
		//all good so we pass it on to the game logic
		$this->game->tryArmyStackSplit($source_army_id, $tile_ids_JSON_stringified);
		
		self::ajaxResponse();
	}
	
	public function action_tryArmyStackMerge()
	{
		self::setAjaxMode();
		
		//ChromePhp::log("server::action_tryArmyStackMerge()");
		
		//grab the passed in arguments
		$source_army_id = self::getArg("source_army_id", AT_int, true);
		$target_army_id = self::getArg("target_army_id", AT_int, true);
		$tile_ids_JSON_stringified = self::getArg("splitting_tiles", AT_json, true);
		
		//safety check on the JSON we got from the webpage
		$this->validateJSonAlphaNum($tile_ids_JSON_stringified, "tile_ids_JSON_stringified");
		
		//all good so we pass it on to the game logic
		$this->game->tryArmyStackMerge($source_army_id, $target_army_id, $tile_ids_JSON_stringified);
		
		self::ajaxResponse();
	}
	
	public function action_tryNextPhase()
	{
		self::setAjaxMode();
		
		$player_id = self::getArg("player_id", AT_int, true);
		
		$this->game->tryNextPhase($player_id);
		
		self::ajaxResponse();
	}
	
	public function action_moveUndead()
	{
		self::setAjaxMode();
		
		$undead_moves_JSON = self::getArg("undead_moves", AT_json, true);
		$this->validateJSonAlphaNum($undead_moves_JSON, "undead_moves_JSON");
		
		$this->game->HandleUndeadAction($undead_moves_JSON);
		
		self::ajaxResponse();
	}
	
	public function action_captureVillage()
	{
		self::setAjaxMode();
		
		$village_info_stringified = self::getArg("village_info", AT_json, true);
		$this->validateJSonAlphaNum($village_info_stringified, "village_info_stringified");
		
		//todo
		$this->game->action_captureVillage($village_info_stringified);
		
		self::ajaxResponse();
	}
	
	public function action_tryEnterPhase()
	{
		self::setAjaxMode();
		
		$player_id = self::getArg("player_id", AT_int, true);
		$phase_id = self::getArg("phase_id", AT_int, true);
		
		$this->game->tryEnterPhase($player_id, $phase_id);
		
		self::ajaxResponse();
	}
	
	public function action_tryPayAction()
	{
		self::setAjaxMode();
		
		$action_type = self::getArg("action_type", AT_int, true);
		$action_info_JSON = self::getArg("action_info", AT_json, true);
		$paid_tile_infos_JSON = self::getArg("paid_tile_infos", AT_json, true);
		$paid_tile_ids_JSON = self::getArg("paid_tile_ids", AT_json, true);
		
		//safety check on the JSON we got from the webpage
		$this->validateJSonAlphaNum($action_info_JSON, "action_info_JSON");
		$this->validateJSonAlphaNum($paid_tile_infos_JSON, "paid_tile_infos_JSON");
		$this->validateJSonAlphaNum($paid_tile_ids_JSON, "paid_tile_infos_JSON");
		
		//todo, see line 695 of game.php
		$this->game->tryPayAction($action_type, $action_info_JSON, $paid_tile_infos_JSON, $paid_tile_ids_JSON);
		
		self::ajaxResponse();
	}
	
	public function action_startBattle()
	{
		self::setAjaxMode();
		
		$battling_province_name = self::getArg("battling_province_name", AT_alphanum, true);
		$this->game->tryStartBattle($battling_province_name);
		
		self::ajaxResponse();
	}
	
	public function action_swapTile()
	{
		self::setAjaxMode();
		
		$swap_tile_id = self::getArg("swap_tile_id", AT_int, true);
		$this->game->trySwapTile($swap_tile_id);
		
		self::ajaxResponse();
	}
	
	public function action_sacrificeUnit()
	{
		self::setAjaxMode();
		
		$sacrifice_tile_id = self::getArg("sacrifice_tile_id", AT_int, true);
		$this->game->sacrificeUnit($sacrifice_tile_id);
		
		self::ajaxResponse();
	}
	
	public function action_rejectWithdraw()
	{
		self::setAjaxMode();
		
		$this->game->tryRejectWithdraw();
		
		self::ajaxResponse();
	}
	
	public function action_withdraw()
	{
		self::setAjaxMode();
		
		$retreat_prov_name = self::getArg("retreat_prov_name", AT_alphanum, true);
		$this->game->tryWithdraw($retreat_prov_name);
		
		self::ajaxResponse();
	}
	
	public function action_retreat()
	{
		self::setAjaxMode();
		
		$retreat_prov_name = self::getArg("retreat_prov_name", AT_alphanum, true);
		$this->game->tryRetreat($retreat_prov_name);
		
		self::ajaxResponse();
	}
	
	public function action_beginBuildVillages()
	{
		self::setAjaxMode();
		
		$this->game->beginBuildVillages();
		
		self::ajaxResponse();
	}
	
	public function action_playerPlaceCitadel()
	{
		self::setAjaxMode();
		
		$prov_name = self::getArg("prov_name", AT_alphanum, true);
		$this->game->tryPlaceCitadel($prov_name);
		
		self::ajaxResponse();
	}
	
	public function action_chooseFaction()
	{
		self::setAjaxMode();
		$faction_id = self::getArg("faction_id", AT_int, true);
		$this->game->tryChooseFactionTemp($faction_id);
		
		self::ajaxResponse();
	}
	
	public function action_unchooseFaction()
	{
		self::setAjaxMode();
		$faction_id = self::getArg("faction_id", AT_int, true);
		$this->game->tryUnchooseFactionTemp($faction_id);
		
		self::ajaxResponse();
	}
	
	public function action_playerDebug()
	{
		self::setAjaxMode();
		
		$this->game->playerDebugAction();
		
		self::ajaxResponse();
	}
}


