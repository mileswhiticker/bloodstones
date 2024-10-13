<?php

trait army
{
	function createArmy($starting_province_name, $player_id, $starting_unit_ids, $spawn_test_units = false)
	{
		$units_string = "";
		if($starting_unit_ids != null)
		{
			$units_string = implode(",",$starting_unit_ids);
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::createArmy($starting_province_name,$player_id,$units_string)"));
		$new_army_id = self::getGameStateValue("next_army_id");
		$new_army_id_type = gettype($new_army_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "new_army_id type: $new_army_id_type"));
		$new_army_id = (int)$new_army_id;
		
		//todo: is this php army module needed?
		//bga just uses associative arrays in js style which is simpler and easier
		//$newarmy = new Army($new_army_id, $starting_province_name, $player_id);
		
		//create it as an associative array
		//$newarmy = array("id_num"=>"$new_army_id","province_id"=>"$starting_province_name","player_id"=>"$player_id","tiles"=>array());
		$newarmy = array("army_id"=>$new_army_id,"prov_name"=>"$starting_province_name","player_id"=>$player_id,"tiles"=>array());
		
		//does this new army start with some pre-existing tiles?
		if(is_array($starting_unit_ids) && count($starting_unit_ids) > 0)
		{
			//grab the appropriate tile deck
			$player_deck = $this->player_decks[$player_id];
			
			//move the list of card ids over to the new army
			//if they are already in another army, this will automatically update them
			$player_deck->moveCards($starting_unit_ids, 'army', $new_army_id);
			try
			{
				$starting_tiles = $player_deck->getCards($starting_unit_ids);
				$newarmy["tiles"] = $starting_tiles;
			}
			catch(Exception $e)
			{
				self::notifyAllPlayers("debug", "", array('debugmessage' => "Exception caught in call to getCards() inside server::createArmy(), the problem was most likely \$starting_unit_ids"));
				self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($e, true)));
				self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($starting_unit_ids, true)));
			}
		}
		else if($spawn_test_units == true)
		{
			//todo: grab some random tiles from this player's deck bag
			$army_size = 3;
			
			//grab the appropriate tile deck
			//$player_deck = $this->faction_decks[$factionid];
			$player_deck = $this->player_decks[$player_id];
			
			//for now just take random tiles from the bag
			//todo: callback handling for the auto reshuffle
			$army_tiles = $player_deck->pickCardsForLocation($army_size, 'bag', 'army', $new_army_id);
			$newarmy["tiles"] = $army_tiles;
			
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($player_deck,true)));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => $player_deck->table));
		}
		
		
		//insert the newly created army into the database
		$sql = "INSERT INTO armies (army_id, province_id, player_id) VALUES ";
		$values[] = "(
			$new_army_id,
			'$starting_province_name',
			$player_id
			)";
		
		$sql .= implode(',', $values);
		self::DbQuery( $sql );
		
		//iterate the army id counter
		$new_army_id += 1;
		self::setGameStateValue("next_army_id", $new_army_id);
		
		return $newarmy;
	}
	
	function tryArmyStackSplit($source_army_id, $tile_ids)
	{
		//is this action allowed in this game state?
        self::checkAction("action_tryArmyStackSplit");
		
		$this->tryArmyStackTransfer($source_army_id, null, $tile_ids, self::SELECT_ARMY_SOURCE);
	}
	
	function tryArmyStackMerge($source_army_id, $target_army_id, $tile_ids)
	{
		//is this action allowed in this game state?
        self::checkAction("action_tryArmyStackMerge");
		
		$this->tryArmyStackTransfer($source_army_id, $target_army_id, $tile_ids, self::SELECT_ARMY_TARGET);
	}
	
    function tryArmyStackTransfer($source_army_id, $target_army_id, $tile_ids = null, $selection_flag = self::SELECT_ARMY_TARGET, $target_province_override = null, $temp_army_id_num = null)
	{
		$current_player_id = $this->getCurrentPlayerId();
		//$current_player = self::getObjectFromDB("SELECT player_id id, player_factionid factionid FROM player WHERE player_id='$current_player_id'");
		$tile_ids_string = "";
		if(!is_null($tile_ids))
		{
			$tile_ids_string = implode(",",$tile_ids);
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryArmyStackTransfer($source_army_id,$target_army_id,$tile_ids_string,$target_province_override,$temp_army_id_num)"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tile_ids,true)));
		//
		$source_army = $this->GetArmy($source_army_id);
		$target_army = null;
		if($target_army_id == null)
		{
			//create a new army stack in the province
			$target_province_name = $target_province_override;
			if($target_province_name == null)
			{
				$target_province_name = $source_army["prov_name"];
			}
			$target_army = $this->createArmy($target_province_name, $source_army['player_id'], $tile_ids, false);
			$target_army_id = $target_army["army_id"];
		}
		else
		{
			//we are moving these tiles into an existing army
			
			//grab the player's deck
			$player_deck = $this->player_decks[$current_player_id];
			
			//we are merging these tiles into an existing army
			if(is_null($tile_ids) || count($tile_ids) == 0)
			{
				//by default, move all cards over
				$player_deck->moveAllCardsInLocation('army', 'army', $source_army_id, $target_army_id);
			}
			else
			{
				$player_deck->moveCards($tile_ids, 'army', $target_army_id);
			}
			
			//have we completely emptied the old army?
			$tiles_left = $player_deck->getCardsInLocation('army', $source_army_id);
			if(count($tiles_left) == 0)
			{
				//delete it from our database
				$this->DeleteArmy($source_army_id);
			}
		}
		
		self::notifyAllPlayers('playerArmyTransfer', '', 
			array(
				'player_id' => $current_player_id,
				'player_name' => $this->getPlayerNameById($current_player_id),
				'source_army_id' => $source_army_id,
				'target_army_id' => $target_army_id,
				'temp_army_id' => $temp_army_id_num,
				'selection_flag' => $selection_flag,
				'tile_ids' => $tile_ids,
				'target_province_override' => $target_province_override
			));
		
		return $target_army;
	}
	
	function GetArmyIdNumFromString($army_id_string)
	{
		//return "blstarmystack" + army_id_num;
		return substr("$army_id_string",13);
	}
	
	function isGiantPresent($army)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::isGiantPresent()"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army,true)));
		
		$player_id = $army['player_id'];
		$player_deck = $this->player_decks[$player_id];
		$army_id = $army['army_id'];
		$tiles = $player_deck->getCardsInLocation("army", $army_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tiles, true)));
		
		foreach($tiles as $tile_id => $tile_info)
		{
			//hillfolk giants are type_arg 24
			if($this->isTileTypeGiant($tile_info['type_arg']))
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "I found a giant in army$army_id"));
				return true;
			}
		}
		
		return false;
	}
	
	function isNecromancerPresent($army)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::isNecromancerPresent()"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army, true)));
		
		$player_id = $army['player_id'];
		$player_deck = $this->player_decks[$player_id];
		$army_id = $army['army_id'];
		$tiles = $player_deck->getCardsInLocation("army", $army_id);
		
		foreach($tiles as $tile_id => $tile_info)
		{
			if($this->isTileTypeNecromancer($tile_info['type_arg']))
			{
				return true;
			}
		}
		
		return false;
	}
	
	function GetArmy($army_id)
	{
		return self::getObjectFromDB("SELECT army_id, player_id, province_id prov_name FROM armies WHERE army_id=$army_id", false);
	}
	
	function GetAllArmies()
	{
		return self::getCollectionFromDb("SELECT army_id, player_id, province_id prov_name FROM armies", false);
	}
	
	function GetArmiesInProvinceFromProvId($prov_id)
	{
		//this is necessary because the db expects "province_id" to be a string, whereas ive now separated it from str "prov_name" and int "province_id"
		$prov_name = $this->getProvinceName($prov_id);
		return $this->GetArmiesInProvinceFromProvName($prov_name);
	}
	
	function GetArmiesInProvinceFromProvName($prov_name)
	{
		return self::getCollectionFromDb("SELECT army_id, player_id, province_id prov_name FROM armies WHERE province_id='$prov_name'", false);
	}
	
	function GetPlayerArmiesInProvinceFromProvId($player_id, $prov_id)
	{
		//this is necessary because the db expects "province_id" to be a string, whereas ive now separated it from str "prov_name" and int "province_id"
		$prov_name = $this->getProvinceName($prov_id);
		return $this->GetPlayerArmiesInProvinceFromProvName($player_id, $prov_name);
	}
	
	function GetPlayerArmiesInProvinceFromProvName($player_id, $prov_name)
	{
		return self::getCollectionFromDb("SELECT army_id, player_id, province_id prov_name FROM armies WHERE player_id='$player_id' AND province_id='$prov_name'", false);
	}
	
	function GetMainPlayerArmyInProvinceFromProvId($player_id, $prov_id)
	{
		//this is necessary because the db expects "province_id" to be a string, whereas ive now separated it from str "prov_name" and int "province_id"
		$prov_name = $this->getProvinceName($prov_id);
		return $this->GetMainPlayerArmyInProvinceFromProvName($player_id, $prov_name);
	}
	
	function GetMainPlayerArmyInProvinceFromProvName($player_id, $province_name)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetMainPlayerArmyInProvinceFromProvName($player_id, $province_name)"));
		$player_province_armies = $this->GetPlayerArmiesInProvinceFromProvName($player_id, $province_name);
		
		//return the first non-citadel army we find
		$citadel_army_id = $this->GetCitadelArmyId($player_id);
		foreach($player_province_armies as $army_id => $army)
		{
			if($citadel_army_id != $army_id)
			{
				return $army;
			}
		}
		return null;
	}
	
	function GetPlayerArmies($player_id)
	{
		return self::getCollectionFromDb("SELECT army_id, player_id, province_id prov_name FROM armies WHERE player_id='$player_id'", false);
	}
	
	function DeleteArmy($army_id)
	{
		self:$this->DbQuery("DELETE FROM armies WHERE army_id='$army_id';");
	}
	
	function GetPendingCaptureArmiesAll()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPendingCaptureArmiesAll()"));
		$players = self::getCollectionFromDb("SELECT player_id FROM player ");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($players, true)));
		$result = [];
		foreach($players as $player_id => $player)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => $player_id));
			$result[$player_id] = $this->GetPendingCaptureArmies($player_id);
		}
		return $result;
	}
	
	function isArmyIdTemp($army_id)
	{
		return $army_id < 0;
	}
	
	function GetPendingCaptureArmies($target_player_id, $first_only = false)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPendingCaptureArmies($target_player_id)"));
		$pending_capture_armies = [];
		$armies = $this->GetPlayerArmies($target_player_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($armies, true)));
		$target_faction_id = $this->getPlayerFactionId($target_player_id);
		/*
		$province_id = $this->getProvinceIdFromName($build_village_info['province_name']);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => $province_id));
		$this->villages_deck->moveCard($village_id, "province", $province_id);
		*/
		$villages = $this->villages_deck->getCardsInLocation("province");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($villages, true)));
		
		/*
		//conventions:
		//$location (varchar16): "hand", $location_arg (int): factionid [0,6]
		//$location (varchar16): "captured", $location_arg (int): factionid [0,6]
		//$location (varchar16): "province", $location_arg (int): prov id [0,999999999+]
		//$type_arg (int): factionid [0,6]
		//these are important because later I will use getCardsOfTypeInLocation( $type, $type_arg=null, $location, $location_arg = null )
		*/
		
		//loop over each enemy village, find the armies in that province, check if any armies belong to this player
		foreach($villages as $village_info)
		{
			//is this village owned by the current player?
			if($village_info["type_arg"] == $target_faction_id)
			{
				//skip it
				continue;
			}
			
			//check the current player armies to see if any are present
			$village_province_id = $village_info["location_arg"];
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking village in prov:$village_province_id"));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($villages, true)));
			
			foreach($armies as $army_id => $army_info)
			{
				//check if this army is in the province
				$army_province_name = $army_info["prov_name"];	//old format
				$army_province_id = $this->getProvinceIdFromName($army_province_name);
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking army in prov:$army_province_id"));
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army_info, true)));
				if($village_province_id == $army_province_id)
				{
					//are we just checking to see if any are capturable?
					if($first_only)
					{
						return true;
					}
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "success"));
					//this village can be captured
					$capture_info = array("province_id" => $village_province_id, "army_id" => $army_id);
					array_push($pending_capture_armies, $capture_info);
				}
			}
		}
		
		return $pending_capture_armies;
	}
	
	function GetUnitsInArmyString($army_id, $player_id)
	{
		$player_deck = $this->player_decks[$player_id];
		$tiles = $player_deck->getCardsInLocation('army', $army_id);
		$tile_name_strings = [];
		foreach($tiles as $tile_id => $tile_info)
		{
			$tile_name_strings[] = $this->getTileNameFromType($tile_info["type_arg"]);
		}
		$units_string = implode(", ",$tile_name_strings);
		return $units_string;
	}
}