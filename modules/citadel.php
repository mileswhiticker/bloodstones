<?php

trait citadel
{
	public function AssignRandomPlayerCitadels()
	{
		//for debugging: assign random player factions, create their citadels, then start the game
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::AssignRandomPlayerCitadels()"));
		$players = self::getCollectionFromDb("SELECT player_id FROM player ");
		$cur_faction_id = 1;//rand(0,5);
		foreach($players as $player_id => $player)
		{
			//create citadel
			//skip chaos horde because they dont have a citadel
			if($cur_faction_id != self::FACTION_CHAOSHORDE)
			{
				$citadel_prov_id = 10 * ($cur_faction_id);
				if($citadel_prov_id > 74)
				{
					$citadel_prov_id -= 74;
				}
				$prov_name = $this->getProvinceName($citadel_prov_id);
				$this->PlaceCitadel($player_id, $prov_name);
			}
			
			$cur_faction_id++;
		}
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "AssignRandomPlayerCitadels() completed successfully"));
	}
	
	public function tryPlaceCitadel($prov_name)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryPlaceCitadel($prov_name)"));
		
		//check if this is a valid province
		$active_player_id = self::getActivePlayerId();
		$legal_province_names = $this->GetPossibleCitadelProvinces($active_player_id);
		
		if(!in_array($prov_name, $legal_province_names))
		{
			throw new BgaUserException( self::_("You cannot place your citadel there!") );
			return;
		}
		
		$this->PlaceCitadel($active_player_id, $prov_name);
		
		$this->gamestate->nextState('nextCitadel');
	}
	
	public function PlaceCitadel($player_id, $prov_name)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::PlaceCitadel($player_id, $prov_name)"));
		
		//update the database
		$prov_id = $this->getProvinceIdFromName($prov_name);
		$this->DbQuery("UPDATE player SET player_citadel_prov='$prov_id' WHERE player_id='$player_id'");
		
		$citadel_tile_info = $this->GetPlayerCitadelTile($player_id);
		
		$player_deck = $this->player_decks[$player_id];
		$citadel_tile_id = $citadel_tile_info['id'];
		$player_deck->moveCard($citadel_tile_id, 'army', $prov_id);
		
		//notify all the players
		self::notifyAllPlayers('newCitadel', clienttranslate('${player_name} has placed their citadel in ${province_ui_name}.'), 
			array(
				'player_name' => $this->getPlayerNameById($player_id),
				'player_id' => $player_id,
				//'built_citadel_army' => $citadel_army_info
				'citadel_prov_id' => $prov_id,
				'citadel_tile_info' => $citadel_tile_info,
				'province_ui_name' => $this->GetProvinceNameUIString($prov_id)
			));
	}
	
	public function GetCapturedCitadels($player_id)
	{
		$captured_citadels = $this->getUniqueValueFromDB("SELECT captured_citadels FROM player WHERE player_id='$player_id'");
		return $captured_citadels;
	}
	
	function GetPlayerCitadelTile($playerid)
	{
		//this should be safe so long as it's called after faction select
		$factionid = $this->getPlayerFactionId($playerid);
		return $this->GetFactionCitadelTile($factionid);
	}
	
	function GetFactionCitadelTile($factionid)
	{
		//this should be safe as long as it's called after tile decks are created
		$faction_deck = $this->faction_decks[$factionid];
		$citadel_tile_type = self::UNIT_CITADEL + self::SPRITESHEET_ROW_TILES * $factionid;
		$citadel_tile = $faction_deck->getCardsOfType('unit', $citadel_tile_type);
		$citadel_tile = array_pop($citadel_tile);
		
		return $citadel_tile;
	}
	
	public function GetPossibleCitadelProvinces($player_id = 0, $use_prov_names = true)
	{
		if($player_id == 0)
		{
			$player_id = self::getActivePlayerId();
		}
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPossibleCitadelProvinces($player_id, $use_prov_names)"));
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "" . count($possible_province_names) . " legal provinces found after removing $num_removed, now checking citadel 2-layer adjacency..."));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($possible_provinces,true)));
		
		//for testing
		//return $possible_province_names;
		
		//get all currently placed citadels
		$players = self::getCollectionFromDb("SELECT player_id, player_citadel_prov FROM player");
		$blocking_prov_names = [];
		
		//loop over each player citadel
		foreach($players as $player_id => $player)
		{
			//-1 here means the player hasnt chosen a province for their citadel yet
			$citadel_prov_id = $player["player_citadel_prov"];
			$num_removed = 0;
			if($citadel_prov_id != -1)
			{
				//here we will get 2 layers of adjacency for the citadel and mark it as "blocking" of other citadels
				$citadel_prov_name = $this->getProvinceName($citadel_prov_id);
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "found citadel in $citadel_prov_name for player $player_id"));
				
				//get the inner (first) layer of adjacency, dont worry about duplicates
				$inner_prov_names = $this->GetAdjProvinceNames($citadel_prov_id);
				$blocking_prov_names = array_merge($blocking_prov_names, $inner_prov_names);
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "inner layer of adjacency has " . count($blocking_prov_names) . " provinces"));
				
				//get the outer (second) layer of adjacency
				foreach($inner_prov_names as $index => $inner_prov_name)
				{
					$inner_prov_id = $this->getProvinceIdFromName($inner_prov_name);
					$outer_prov_names = $this->GetAdjProvinceNames($inner_prov_id);
					$blocking_prov_names = array_merge($blocking_prov_names, $outer_prov_names);
					/*foreach($outer_prov_names as $index => $outer_prov_name)
					{
						//only add the outer prov if it isn't already in our list
						//use false here as the explicit return value because index 0 is possible
						if(array_search($outer_prov_name, $blocking_prov_names) === false)
						{
							array_push($blocking_prov_names, $outer_prov_name);
						}
					}*/
				}
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "total number of blocking provinces: " . count($blocking_prov_names)));
				
				//make sure the citadel province itself is added to the invalid list
				array_push($blocking_prov_names, $citadel_prov_name);
				
				/*
				//finally, remove those blockers from the possible provinces
				foreach($blocking_prov_names as $index => $blocking_prov_name)
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking $blocking_prov_name..."));
					$found_index = array_search($blocking_prov_name, $possible_province_names);
					if($found_index != false)
					{
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "out of of " . count($possible_province_names) . " elements, removing index $found_index"));
						//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($possible_province_names,true)));
						array_splice($possible_province_names, $found_index, 1);
						$num_removed += 1;
						$found_index = array_search($blocking_prov_name, $possible_province_names);
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "" . count($possible_province_names) . " elements remaining"));
						//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($possible_province_names,true)));
						
						if($found_index != false)
						{
							//self::notifyAllPlayers("debug", "", array('debugmessage' => "WARNING: found duplicate at index $found_index"));
						}
					}
					else
					{
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "warning! could not find"));
					}
				}
				*/
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "removed $num_removed due to that citadel, " . count($possible_province_names) . " provinces remaining"));
			}
		}
		
		$all_provinces = $this->getAllProvinces();
		$possible_province_names = [];
		$num_removed = 0;
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPossibleCitadelProvinces($player_id) all_provinces:" . count($all_provinces)));
		
		//first filter out any invalid province types
		foreach($all_provinces as $index => $cur_prov)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking index: $index"));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($cur_prov,true)));
			$remove = false;
			
			//check for invalid province types
			switch($cur_prov["type"])
			{
				case "Sea":
				{
					$remove = true;
					break;
				}
				case "Desert":
				{
					$remove = true;
					break;
				}
				case "Mountains":
				{
					$remove = true;
					break;
				}
			}
			
			//check if we are within 2 layers of another citadel
			$cur_prov_name = $this->getProvinceName($cur_prov["id"]);
			if(!$remove)
			{
				if(array_search($cur_prov_name, $blocking_prov_names) !== false)
				{
					$remove = true;
				}
			}
			
			if($remove)
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "removing " . $cur_prov["type"]));
				$num_removed += 1;
			}
			else
			{
				if($use_prov_names)
				{
					array_push($possible_province_names, $cur_prov_name);
				}
				else
				{
					array_push($possible_province_names, $cur_prov["id"]);
				}
			}
		}
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "finished! " . count($possible_province_names) . " provinces in final count"));
		
		return $possible_province_names;
	}
	
	public function GetAllCitadelProvNames()
	{
		$citadel_provs = $this->getCollectionFromDb("SELECT player_citadel_prov FROM player");
		$citadel_prov_names = [];
		foreach($citadel_provs as $citadel_prov)
		{
			$citadel_prov_id = $citadel_prov["player_citadel_prov"];
			$citadel_prov_name = $this->getProvinceName($citadel_prov_id);
			array_push($citadel_prov_names, $citadel_prov_name);
		}
		return $citadel_prov_names;
	}
	
	public function GetCitadelArmyId($player_id)
	{
		$citadel_tile_info = $this->GetPlayerCitadelTile($player_id);
		if($citadel_tile_info["location"] == "army")
		{
			return $citadel_tile_info["location_arg"];
		}
		return -1;
	}
}