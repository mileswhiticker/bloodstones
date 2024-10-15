<?php

trait province
{
	public function getProvinceName($prov_id)
	{
		return "prov" . $prov_id;
	}
	
	public function getProvinceInfo($prov_id)
	{
		$all_provinces = $this->getAllProvinces();
		return $all_provinces[intval($prov_id)];
	}
	
	public function getProvinceIdFromName($prov_name)
	{
		return substr($prov_name, 4);
	}
	
	public function getAllProvinces()
	{
		$all_provinces = [["id"=>0,"type" => "Sea","movement_links" => [2,8,1]],["id"=>1,"type" => "Forest","movement_links" => [10,2,8,0,11,9]],["id"=>2,"type" => "Forest","movement_links" => [0,1,3,12,11]],["id"=>3,"type" => "Forest","movement_links" => [2,4,12,13]],["id"=>4,"type" => "Forest","movement_links" => [3,13,5,14]],["id"=>5,"type" => "Forest","movement_links" => [4,14,15,6]],["id"=>6,"type" => "Forest","movement_links" => [5,7,15,16,17]],["id"=>7,"type" => "Forest","movement_links" => [6,17]],["id"=>8,"type" => "Sea","movement_links" => [0,1,9,27,25,18,10]],["id"=>9,"type" => "Forest","movement_links" => [8,10,1]],["id"=>10,"type" => "Forest","movement_links" => [1,9,11,18,8,19]],["id"=>11,"type" => "Forest","movement_links" => [19,2,10,12,1]],["id"=>12,"type" => "Hills","movement_links" => [2,19,3,13,11]],["id"=>13,"type" => "Hills","movement_links" => [12,4,3,14,21,19]],["id"=>14,"type" => "Plains","movement_links" => [4,5,15,22,13,21]],["id"=>15,"type" => "Plains","movement_links" => [5,6,16,22,14]],["id"=>16,"type" => "Plains","movement_links" => [6,17,15,22,24,23]],["id"=>17,"type" => "Hills","movement_links" => [6,7,16,24]],["id"=>18,"type" => "Plains","movement_links" => [10,19,20,28,27,8]],["id"=>19,"type" => "Plains","movement_links" => [11,18,12,13,20,21,10]],["id"=>20,"type" => "Plains","movement_links" => [19,21,30,29,28,18]],["id"=>21,"type" => "Plains","movement_links" => [13,14,20,30,22,19]],["id"=>22,"type" => "Plains","movement_links" => [16,15,14,21,23,30]],["id"=>23,"type" => "Mountains","movement_links" => [16,22,30,24,31,32]],["id"=>24,"type" => "Forest","movement_links" => [17,16,23,32,33]],["id"=>25,"type" => "Sea","movement_links" => [27,8,26,34,35]],["id"=>26,"type" => "Plains","movement_links" => [27,25,35]],["id"=>27,"type" => "Plains","movement_links" => [18,8,25,26,28,35]],["id"=>28,"type" => "Plains","movement_links" => [20,18,35,36,29,27]],["id"=>29,"type" => "Forest","movement_links" => [20,36,28,38,30,37]],["id"=>30,"type" => "Hills","movement_links" => [21,22,23,31,38,20,29]],["id"=>31,"type" => "Forest","movement_links" => [32,23,30,40,38]],["id"=>32,"type" => "Forest","movement_links" => [24,31,33,40,23]],["id"=>33,"type" => "Sea","movement_links" => [24,32,40,41,42]],["id"=>34,"type" => "Plains","movement_links" => [25,35,43,44]],["id"=>35,"type" => "Sea","movement_links" => [26,34,28,36,47,46,44,45,25,27]],["id"=>36,"type" => "Plains","movement_links" => [28,29,37,48,35,47]],["id"=>37,"type" => "Plains","movement_links" => [38,36,39,49,48,29]],["id"=>38,"type" => "Hills","movement_links" => [31,30,29,37,39]],["id"=>39,"type" => "Plains","movement_links" => [37,40,41,38,49]],["id"=>40,"type" => "Plains","movement_links" => [33,32,31,39,41]],["id"=>41,"type" => "Plains","movement_links" => [40,33,42,51,50,39,49]],["id"=>42,"type" => "Sea","movement_links" => [33,41,51,59,69]],["id"=>43,"type" => "Plains","movement_links" => [44,34,52]],["id"=>44,"type" => "Plains","movement_links" => [35,43,34,45,52]],["id"=>45,"type" => "Sea","movement_links" => [44,35,54,53,52,61,46]],["id"=>46,"type" => "Plains","movement_links" => [35,47,54,55,45]],["id"=>47,"type" => "Plains","movement_links" => [48,36,35,46,55,56,55]],["id"=>48,"type" => "Hills","movement_links" => [37,36,47,49,56,57]],["id"=>49,"type" => "Plains","movement_links" => [41,39,37,48,57,50]],["id"=>50,"type" => "Plains","movement_links" => [51,41,49,57,50,50]],["id"=>51,"type" => "Forest","movement_links" => [42,41,59,58,50]],["id"=>52,"type" => "Forest","movement_links" => [45,44,43,60,61]],["id"=>53,"type" => "Plains","movement_links" => [54,45,61,62,63]],["id"=>54,"type" => "Plains","movement_links" => [45,46,63,53,55]],["id"=>55,"type" => "Plains","movement_links" => [47,46,47,63,64,66,54]],["id"=>56,"type" => "Forest","movement_links" => [47,48,66,57]],["id"=>57,"type" => "Mountains","movement_links" => [48,56,49,50,58,66]],["id"=>58,"type" => "Plains","movement_links" => [51,59,57,67,66,68]],["id"=>59,"type" => "Plains","movement_links" => [42,51,58,68,69]],["id"=>60,"type" => "Forest","movement_links" => [52,61]],["id"=>61,"type" => "Sea","movement_links" => [60,45,53,62,71,52]],["id"=>62,"type" => "Plains","movement_links" => [53,61,63,71]],["id"=>63,"type" => "Hills","movement_links" => [55,54,64,62,53,71,72]],["id"=>64,"type" => "Plains","movement_links" => [63,55,72,65,66]],["id"=>65,"type" => "Hills","movement_links" => [72,66,64,67,73]],["id"=>66,"type" => "Forest","movement_links" => [55,56,57,65,64,67,58]],["id"=>67,"type" => "Plains","movement_links" => [65,73,68,58,66]],["id"=>68,"type" => "Plains","movement_links" => [67,73,74,70,69,59,58]],["id"=>69,"type" => "Plains","movement_links" => [42,70,68,59]],["id"=>70,"type" => "Plains","movement_links" => [69,74,68]],["id"=>71,"type" => "Desert","movement_links" => [63,62,61,72]],["id"=>72,"type" => "Desert","movement_links" => [71,63,64,73,65]],["id"=>73,"type" => "Desert","movement_links" => [74,72,67,68,65]],["id"=>74,"type" => "Desert","movement_links" => [70,73,68]]];
		return $all_provinces;
	}
	
	public function GetAdjProvinceNames($prov_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetAdjProvinceNames($prov_id)"));
		$adj_provinces = [];
		$province = $this->getAllProvinces()[$prov_id];
		foreach($province["movement_links"] as $connected_prov_id)
		{
			$adj_province_name = $this->getProvinceName($connected_prov_id);
			array_push($adj_provinces, $adj_province_name);
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($adj_provinces,true)));
		return $adj_provinces;
	}
	
	public function GetAdjSeaProvIds($prov_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetAdjSeaProvIds($prov_id)"));
		$adj_provinces = [];
		$province = $this->getAllProvinces()[$prov_id];
		foreach($province["movement_links"] as $connected_prov_id)
		{
			$check_prov = $this->getAllProvinces()[$connected_prov_id];
			
			if($check_prov["type"] == "Sea")
			{
				$adj_provinces[] = $connected_prov_id;
			}
		}
		return $adj_provinces;
	}
	
	public function GetProvinceTypeName($prov_id)
	{
		$prov = $this->getAllProvinces()[$prov_id];
		return $prov["type"];
	}
	
	public function GetProvinceTypeFromName($prov_name)
	{
		$prov_id = $this->getProvinceIdFromName($prov_name);
		return $this->GetProvinceTypeName($prov_id);
	}
	
	public function MergePlayerArmiesInProvince($prov_id, $player_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::MergePlayerArmiesInProvince($prov_id, $player_id)"));
		
		//merge together all of this player's armies in this province
		$merging_armies = $this->GetPlayerArmiesInProvinceFromProvId($player_id, $prov_id);
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($merging_armies,true)));
		$merged_army_ids = [];
		
		$main_army = null;
		$main_army_id = -1;
		foreach($merging_armies as $army_id => $army)
		{
			if(is_null($main_army))
			{
				$main_army = $army;
				$main_army_id = $army["army_id"];
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "main retreating army: army $main_army_id"));
			}
			else
			{
				//merge it in... tryArmyStackTransfer() will automatically notify the players
				//function tryArmyStackTransfer($source_army_id, $target_army_id, $tile_ids, $selection_flag, $target_province_override = null, $temp_army_id_num = null)
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "merging army $army_id into army $main_army_id"));
				$this->tryArmyStackTransfer($army_id, $main_army_id);
				$merged_army_ids[] = $army_id;
			}
		}
		
		//tell the players
		/*self::notifyAllPlayers("combineProvinceArmies", "", array(
			'merged_army_ids' => $merged_army_ids,
			'main_army_id' => $main_army_id
			));*/
		
		return $main_army;
	}
	
	public function GetProvinceRetreatOptions($prov_id, $retreat_player_id)
	{
		$battle_prov_name = $this->getProvinceName($prov_id);
		
		//get the retreating armies in this province so we can get a list of tiles
		$retreating_armies = $this->GetPlayerArmiesInProvinceFromProvName($retreat_player_id, $battle_prov_name);
		$retreating_tiles_deck = $this->player_decks[$retreat_player_id];
		$retreating_tiles = [];
		
		//loop over the retreating armies and get their tiles
		foreach($retreating_armies as $retreating_army_id => $retreating_army)
		{
			$tiles_found = $retreating_tiles_deck->getCardsInLocation("army", $retreating_army_id);
			$retreating_tiles = array_merge($retreating_tiles, $tiles_found);
		}
		
		/*
		array(
		   'id' => ..,          // the card ID
		   'type' => ..,        // the card type
		   'type_arg' => ..,    // the card type argument
		   'location' => ..,    // the card location
		   'location_arg' => .. // the card location argument
		);
		*/
		
		$retreat_faction_id = $this->getPlayerFactionId($retreat_player_id);
		$all_provinces = $this->getAllProvinces();
		$start_prov = $all_provinces[$prov_id];
		$retreat_prov_options = [];
		
		//loop over each possible move target province
		$safe_option_exists = 0;
		$dangerous_option_exists = 0;
		foreach($start_prov["movement_links"] as $linked_prov_id)
		{
			$linked_prov = $all_provinces[$linked_prov_id];
			
			//start preparing the info we will send
			$move_info = ["name" => $this->getProvinceName($linked_prov_id), "dangerous" => 0];
			//0=safe, 1=dangerous
			//note: if it is impassable then consider it passable but dangerous. units that normally cant enter will just die
			$prov_type = $linked_prov["type"];
			
			//loop over all units in the army to determine move status
			foreach($retreating_tiles as $tile_info)
			{
				$tile_type = $tile_info['type_arg'];
				if(!$this->TileCanMove($tile_type, $prov_type, $retreat_faction_id) ||
					$this->IsTileDangerousProvince($tile_type, $prov_type))
				{
					//we only need 1 tile to find this dangerous or impassable and that will mark the province as dangerous
					$move_info["dangerous"] = 1;
					$dangerous_option_exists = 1;
					break;
				}
			}
			
			if($move_info["dangerous"] == 0)
			{
				$safe_option_exists = 1;
			}
			
			//check for enemy units in this province
			//todo
			
			//add it to the list
			$retreat_prov_options[] = $move_info;
		}
		
		//if we have any safe options, them remove any dangerous options
		if($safe_option_exists && $dangerous_option_exists)
		{
			$new_retreat_prov_options = [];
			foreach($retreat_prov_options as $retreat_option)
			{
				if(!$retreat_option["dangerous"])
				{
					$new_retreat_prov_options[] = $retreat_option;
				}
			}
			
			$retreat_prov_options = $new_retreat_prov_options;
		}
		
		return $retreat_prov_options;
	}
	
	public function TileCanMove($tile_type, $province_type, $factionid)
	{
		switch($province_type)
		{
			case 'Mountains':
			{
				//is the tile a dragon?
				if($tile_type == 34)
				{
					//unit can move here
					return 1;
				}
				
				//is the player a hill folk faction?
				if($factionid == 1)
				{
					//unit can move here
					return 1;
				}
				
				//block all other unit movement
				return 0;
			}
			case 'Sea':
			{
				//is the tile a ship?
				if($tile_type%7 == 0)
				{
					//unit can move here
					return 1;
				}
				
				//is the tile a dragon?
				if($tile_type == 34)
				{
					//unit can move here
					return 1;
				}
				
				//block all other unit movement
				return 0;
			}
		}
		
		//allow all other unit movement
		return 1;
	}
	
	public function IsTileDangerousProvince($tile_type, $province_type)
	{
		switch($province_type)
		{
			case 'Desert':
			{
				switch(tile_type)
				{
					case 25:
					{
						//is the tile a lizardman?
						return 0;
					}
					case 34:
					{
						//is the tile a dragon?
						return 0;
					}
					case 59:
					{
						//is the tile a undead?
						return 0;
					}
					case 49:
					{
						//is the tile a goblin?
						return 0;
					}
				}
				
				//all other units find this province dangerous
				return 1;
			}
		}
		
		//all other provinces are safe
		return 0;
	}
	
	public function isProvinceVillageLegal($province_type)
	{
		switch($province_type)
		{
			case 'Hills':
			{
				return true;
			}
			case 'Plains':
			{
				return true;
			}
			case 'Forest':
			{
				return true;
			}
		}
		return false;
	}
	
	public function GetProvinceVillageCost($province_type)
	{
		switch($province_type)
		{
			case 'Hills':
			{
				return 2;
			}
			case 'Plains':
			{
				return 1;
			}
			case 'Forest':
			{
				return 1;
			}
		}
		return 9999;
	}
	
	public function GetProvinceVillageSlotsMax($province_type)
	{
		switch($province_type)
		{
			case 'Hills':
			{
				return 1;
			}
			case 'Plains':
			{
				return 2;
			}
			case 'Forest':
			{
				return 1;
			}
		}
		return 0;
	}
	
	public function GetProvinceVillageSlotsAvailable($province_id, $faction_id)
	{
		$province_type = $this->GetProvinceTypeName($province_id);
		$slots_max = $this->GetProvinceVillageSlotsMax($province_type);
		$slots_avail = $slots_max - $this->countProvinceVillagesBuilt($province_id, $faction_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetProvinceVillageSlotsAvailable($province_id, $faction_id): $slots_avail"));
		
		return $slots_avail;
	}
	
	function getProvinceVillagesBuilt($faction_id, $province_id)
	{
		//$faction_id = $this->GetPlayerFaction($player_id);
		//return $this->getVillagesBuiltFactionInfos($faction_id);
		$village_infos = $this->villages_deck->getCardsOfTypeInLocation("village", $faction_id, "province", $province_id);
		return $village_infos;
	}
	
	function countProvinceVillagesBuilt($province_id, $faction_id)
	{
		$num = count($this->getProvinceVillagesBuilt($faction_id, $province_id));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::countProvinceVillagesBuilt($province_id, $faction_id): $num"));
		return $num;
	}
	
	function GetProvinceNameUIString($prov_id)
	{
		return "Area $prov_id (" . $this->GetProvinceTypeName($prov_id) . ")";
	}
}