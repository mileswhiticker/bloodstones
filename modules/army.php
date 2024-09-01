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
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::createArmy(starting_province_name:$starting_province_name,player_id:$player_id,starting_unit_ids:[$units_string])"));
		$new_army_id = self::getGameStateValue("next_army_id");
		
		//todo: is this php army module needed?
		//bga just uses associative arrays in js style which is simpler and easier
		//$newarmy = new Army($new_army_id, $starting_province_name, $player_id);
		
		//create it as an associative array
		$newarmy = array("id_num"=>"$new_army_id","province_id"=>"$starting_province_name","player_id"=>"$player_id","tiles"=>array());
		
		if($spawn_test_units == true)
		{
			//todo: grab some random tiles from this player's deck bag
			$army_size = 3;
			
			//grab the appropriate tile deck
			//$player_deck = $this->faction_decks[$factionid];
			$player_deck = $this->player_decks[$player_id];
			
			//for now just take random tiles from the bag
			//todo: callback handling for the auto reshuffle
			$army_tiles = $player_deck->pickCardsForLocation($army_size, 'bag', 'army', $new_army_id);
			$newarmy["tiles"] = array_merge($newarmy["tiles"],$army_tiles);
			
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($player_deck,true)));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => $player_deck->table));
		}
		
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
				$newarmy["tiles"] = array_merge($newarmy["tiles"], $starting_tiles);
			}
			catch(Exception $e)
			{
				self::notifyAllPlayers("debug", "", array('debugmessage' => "Exception caught in call to getCards() inside server::createArmy(), the problem was most likely \$starting_unit_ids"));
				self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($e, true)));
				self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($starting_unit_ids, true)));
			}
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
	
	function GetArmiesInProvinceFromProvId($prov_id)
	{
		$prov_name = $this->getProvinceName($prov_id);
		return $this->GetArmiesInProvinceFromProvName($prov_name);
	}
	
	function GetArmiesInProvinceFromProvName($prov_name)
	{
		return self::getCollectionFromDb("SELECT * FROM armies WHERE province_id='$prov_name';", false);
	}
	
	function GetPlayerArmies($player_id)
	{
		return self::getCollectionFromDb("SELECT * FROM armies WHERE player_id='$player_id';", false);
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
				$army_province_name = $army_info["province_id"];	//old format
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
}