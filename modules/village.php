<?php

trait village
{
	function tryPlayerBuildVillages($action_type, $action_info, $paid_tile_infos)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryPlayerBuildVillages($action_type, [...], [...])"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($action_info,true)));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($paid_tile_infos,true)));
		
		//note: the ajax entry point for this function is via action_tryPayAction
		//this isn't standard bga convention, im trying to minimise redundant code here
		//it should still be secure but there is a small chance of security risk
		//todo: with $bThrowException set to false i have to manually handle the failures
		self::checkAction("action_playerBuildVillages", false);
		
		$active_player_id = self::getActivePlayerId();
		$active_faction_id = $this->getPlayerFactionId($active_player_id);
		$num_planned_villages = count($action_info);
		//$owner_player_name = self::getCurrentPlayerName();
		$retval = ["failure_reason" => self::VILLAGE_FAIL_UNKNOWN, "amount_paid" => 0];
		
		//legality check - loop over each requested build and check if it's allowed
		
		//has there been no queued villages? therefore interpret that as a skip
		if($num_planned_villages == 0)
		{
			$retval["failure_reason"] = self::VILLAGE_SKIP;
			return $retval;
		}
		
		//check the player tiles payment
		$payment_check_info = $this->checkTilePaymentInfos($paid_tile_infos, true);
		if($payment_check_info["amount_paid"] == 0)
		{
			$retval["failure_reason"] = self::VILLAGE_FAIL_PIPS;
			return $retval;
		}
		
		//does the player have enough remaining unbuilt villages?
		$villages_avail = $this->countPlayerVillagesAvailable($active_player_id);
		if($villages_avail < $num_planned_villages)
		{
			$retval["failure_reason"] = self::VILLAGE_FAIL_AVAIL;
			return $retval;
		}
		
		//loop over planned villages to do various checks
		$pips_needed = 0;
		$citadel_prov_names = $this->GetAllCitadelProvNames();
		foreach($action_info as $index => $build_village_info)
		{
			$province_name = $build_village_info['province_name'];
			$province_id = $this->getProvinceIdFromName($province_name);
			$province_type = $this->GetProvinceTypeName($province_id);
			
			//is this province a legal type: plains, hills, forest
			if(!$this->isProvinceVillageLegal($province_type))
			{
				$retval["failure_reason"] = self::VILLAGE_FAIL_PROV;
				return $retval;
			}
			
			//does this province have available slots? (2 for plains, 1 otherwise)
			if($this->GetProvinceVillageSlotsAvailable($province_id, $active_faction_id) <= 0)
			{
				$retval["failure_reason"] = self::VILLAGE_FAIL_SLOTS;
				return $retval;
			}
			
			//does this province contain enemy units?
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking $province_name for enemy armies"));
			$armies_in_province = $this->GetArmiesInProvinceFromProvName($province_name);
			foreach($armies_in_province as $army_id => $army)
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army,true)));
				if($army["player_id"] != $active_player_id)
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "found enemy army! " . $army["player_id"] . " | $active_player_id"));
					$retval["failure_reason"] = self::VILLAGE_FAIL_ENEMIES;
					return $retval;
				}
			}
			
			//does this province contain a citadel?
			//todo
			if(in_array($province_name, $citadel_prov_names))
			{
				$retval["failure_reason"] = self::VILLAGE_FAIL_CITADEL;
				return $retval;
			}
			
			//does this province have friendlies in or adjacent to it? 
			//update: i dont know why i added this check. it's not a rule
			/*
			$friendlies_found = false;
			
			//check this province
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking this province for friendly armies..."));
			foreach($armies_in_province as $army_id => $army)
			{
				if($army["player_id"] == $active_player_id)
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "found friendly army in this province"));
					$friendlies_found = true;
					break;
				}
			}
			
			//check the adjacent provinces
			if(!$friendlies_found)
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking adjacent province for friendly armies..."));
				$adj_prov_names = $this->GetAdjProvinceNames($province_id);
				foreach($adj_prov_names as $adj_prov_name)
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking $adj_prov_name..."));
					$armies_in_province = $this->GetArmiesInProvinceFromProvName($adj_prov_name);
					foreach($armies_in_province as $army_id => $army)
					{
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking army$army_id..."));
						//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army,true)));
						if($army["player_id"] == $active_player_id)
						{
							//self::notifyAllPlayers("debug", "", array('debugmessage' => "success! friendly army found"));
							$friendlies_found = true;
							break;
						}
					}
					if($friendlies_found)
					{
						break;
					}
				}
			}
			
			//if we still couldnt find any friendlies, then this province is invalid
			if(!$friendlies_found)
			{
				$retval["failure_reason"] = self::VILLAGE_FAIL_FRIENDLIES;
				return $retval;
			}
			*/
			
			//what is the cost of building in this province?
			$pips_needed += $this->GetProvinceVillageCost($province_type);
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "pips_needed: $pips_needed"));
		
		//sanity check, it should never have reached this point
		if($pips_needed == 0)
		{
			$retval["failure_reason"] = self::VILLAGE_SKIP;
			return $retval;
		}
		
		//did the player pay enough pips? 
		if($payment_check_info["amount_paid"] < $pips_needed)
		{
			$retval["failure_reason"] = self::VILLAGE_FAIL_PIPS;
			return $retval;
		}
		
		//see setupVillagesDeck() on line ~307 of setup.php
		//getCardsInLocation( $location, $location_arg = null, $order_by = null )
		$available_village_infos = $this->villages_deck->getCardsInLocation("hand", $active_faction_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($available_village_infos,true)));
		
		//loop over each newly built village and update a corresponding one in the database (from hand -> province)
		$villages_built = 0;
		$retval["newly_built_villages"] = [];
		foreach($action_info as $index => $build_village_info)
		{
			//$build_village_info["temp_id"] is also passed in here but i'm not using it because villages are fungible on the client
			//note: villages on the server Deck object are not fungible (they have a unique id) but i mostly dont need them
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($build_village_info,true)));
			
			//villages are treated as fungible. simply get the next available
			$success = false;
			foreach($available_village_infos as $village_id => $avail_village_info)
			{
				//grab the first one
				$next_available_village_info = $avail_village_info;
				$village_id = $next_available_village_info["id"];
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($next_available_village_info,true)));
				
				//move the village from hand to province
				$province_id = $this->getProvinceIdFromName($build_village_info['province_name']);
				//self::notifyAllPlayers("debug", "", array('debugmessage' => $province_id));
				$this->villages_deck->moveCard($village_id, "province", $province_id);
				
				//remove it from the array
				unset($available_village_infos[$village_id]);
				
				//remember it for our client to update
				$next_available_village_info = $this->villages_deck->getCard($village_id);
				array_push($retval["newly_built_villages"], $next_available_village_info);
				
				//immediately finish
				$success = true;
				$villages_built++;
				break;
			}
			
			if(!$success)
			{
				//we have run out of available villages
				//safety checks should have handled it before this point so this is a sanity check
				//todo: what else needs to be done here
				$retval["failure_reason"] = self::VILLAGE_FAIL_AVAIL;
				return $retval;
			}
		}
		
		if($villages_built == 0)
		{
			$retval["failure_reason"] = self::VILLAGE_SKIP;
			return $retval;
		}
		
		//for testing, pretend we failed here. client will autoreset and let us go again to test updated server code
		//return $retval;
		
		//sanity check
		if($success)
		{
			$this->DiscardTilesFromHand($paid_tile_infos, $active_player_id);
			$retval["failure_reason"] = self::VILLAGE_SUCCESS;
			$this->incStat($villages_built, "villages_built", $active_player_id);
		}
		
		return $retval;
	}
	
	function GetPossibleVillageProvinces($player_id)
	{
		//rather than looping through every province, the easier way is to get all existing armies+villages for this player then check their provinces
		//todo: why am i using province names here instead of ids? i'm allowed to have arrays of numbers lmao
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPossibleVillageProvinces($player_id)"));
		$possible_provinces = [];
		
		//can build in provinces adjacent to citadel (but not citadel province!)
		$citadel_prov_id = $this->GetPlayerCitadelProvId($player_id);
		$cit_adj_prov_names = $this->GetAdjProvinceNames($citadel_prov_id);
		$possible_provinces = array_merge($possible_provinces, $cit_adj_prov_names);
		
		//can build in provinces holding or adjacent to armies
		//todo: can only build villages adjacent to armies that connect to another village or citadel... this algo here is incorrect
		//i've now moved the initial checks to client, so this function will in future be used for legality checks
		$armies = $this->GetPlayerArmies($player_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking armies..."));
		foreach($armies as $army_id => $army_info)
		{
			//province_id here is a varchar(16) which is a legacy from early in development
			//i have since changed the standard that "X_id" be reserved for int types
			//"X_name" should now be used for varchar(16) types which contain the int id somewhere in them
			//the database is one of the last holdouts of the old system that uses "X_id" for an int type
			$province_name = $army_info["province_id"];
			
			//cant build villages at the citadel
			if(!in_array($province_name, $possible_provinces))
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "adding $province_name"));
				array_push($possible_provinces, $province_name);
			}
			
			//get all adjacent provinces to this one and add them to the list
			$province_id = $this->getProvinceIdFromName($province_name);
			$adj_prov_names = $this->GetAdjProvinceNames($province_id);
			//$province = $this->getAllProvinces()[$province_id];
			foreach($adj_prov_names as $index => $adj_prov_name)
			{
				if(!in_array($adj_prov_name, $possible_provinces))
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "adding adjacent $adj_prov_name"));
					array_push($possible_provinces, $adj_prov_name);
				}
			}
		}
		
		//can build in provinces with or adjacent to existing villages
		$village_infos = $this->getPlayerVillagesBuilt($player_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking villages..."));
		foreach($village_infos as $village_info)
		{
			$province_name = $this->getProvinceName($village_info["location_arg"]);
			if(!in_array($province_name, $possible_provinces))
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "adding $province_name"));
				array_push($possible_provinces, $province_name);
			}
			//
			/*
			$province_id = $this->getProvinceIdFromName($build_village_info['province_name']);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => $province_id));
			$this->villages_deck->moveCard($village_id, "province", $province_id);
			*/
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($possible_provinces,true)));
		
		//todo: chains of units or ships can allow village building
		
		//get citadel locations
		$citadel_provs = $this->getCollectionFromDb("SELECT player_citadel_prov FROM player");
		$citadel_prov_names = $this->GetAllCitadelProvNames();
		
		//loop over these provinces and check for disqualifying conditions
		$final_provinces = [];
		foreach($possible_provinces as $province_name)
		{
			//is this a valid province type?
			$prov_type = -1;
			if(!$this->isProvinceVillageLegal($this->GetProvinceTypeFromName($province_name)))
			{
				//cant build villages here eg desert/sea/mountains
				continue;
			}
			
			//enemies present block village building
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking for enemies..."));
			$prov_armies = $this->GetArmiesInProvinceFromProvName($province_name);
			$enemy_present = false;
			foreach($prov_armies as $army_id => $army_info)
			{
				//is this an enemy army?
				if($army_info["player_id"] != $player_id)
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "found enemies. removing $province_name"));
					
					//remove this province from possible village build locations
					$enemy_present = true;
					//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($possible_provinces,true)));
					
					//don't need to check for any more enemy armies, one is enough
					break;
				}
			}
			
			if($enemy_present)
			{
				continue;
			}
			
			//check if there is a citadel here
			if(in_array($province_name, $citadel_prov_names))
			{
				continue;
			}
			
			//no problems so lets keep this province
			array_push($final_provinces, $province_name);
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($possible_provinces,true)));
		
		return $final_provinces;
	}
}