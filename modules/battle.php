<?php

trait battle
{
	function spawnBattle()
	{
		self::checkAction('action_spawnBattle'); 
		
		$prov_name = $this->getProvinceName(1);
		
		$owner_player_id = self::getActivePlayerId();
		
		//for testing
		self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($this->GetPendingCaptureArmies($owner_player_id), true)));
		return;
		
		$new_army = $this->createArmy($prov_name, $owner_player_id, null, true);
		
		self::notifyAllPlayers('playerCreateArmy', '${player_name} has spawned test army #1 for battle', 
			array(
				'player_name' => $this->getPlayerNameById($owner_player_id),
				//'army_id' => $new_army["army_id"],
				//'player_id' => $owner_player_id,
				//'province_id' => $prov_name,
				//'tiles' => $new_army["tiles"],
				'pending_battles_update' => $this->GetPendingBattleProvincesAll(),
				'army_info' => $new_army
				//'from_div_id' => "bag"
			));
			
		$owner_player_id = self::getPlayerAfter($owner_player_id);
		$new_army = $this->createArmy($prov_name, $owner_player_id, null, true);
		
		self::notifyAllPlayers('playerCreateArmy', '${player_name} has spawned test army #2 for battle', 
			array(
				'player_name' => $this->getPlayerNameById($owner_player_id),
				//'army_id' => $new_army["army_id"],
				//'player_id' => $owner_player_id,
				//'province_id' => $prov_name,
				//'tiles' => $new_army["tiles"],
				'pending_battles_update' => $this->GetPendingBattleProvincesAll(),
				'army_info' => $new_army
				//'from_div_id' => "bag"
			));
		/*
		try
		{
			$pending_battle_provinces = $this->GetPendingBattleProvincesAll();
			self::notifyAllPlayers("debug", "", array('debugmessage' => 'server::findBattle() success'));
			self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($pending_battle_provinces,true)));
		}
		catch (Exception $e)
		{
			self::notifyAllPlayers("debug", "", array('debugmessage' => 'server::findBattle() fail'));
		}
		*/
	}
	
	function trySwapTile($swap_tile_id)
	{
		//check if this action is allowed by the active player
		self::checkAction('action_swapTile'); 
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::trySwapTile($swap_tile_id)"));
		
		//some useful info
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		$current_player_id = $this->getCurrentPlayerId();
		$other_player_id = $attacking_player_id;
		if($other_player_id == $current_player_id)
		{
			$other_player_id = $defending_player_id;
		}
		
		//a value of -1 means this player is trying to skip their swap
		if($swap_tile_id >= 0)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "trySwapTile() check1"));
			
			//identify which player we are dealing with (attacker or defender)
			$current_battle_deck = null;
			if($current_player_id == $attacking_player_id)
			{
				$current_battle_deck = $this->attacker_dice_deck;
			}
			else if($current_player_id == $defending_player_id)
			{
				$current_battle_deck = $this->defender_dice_deck;
			}
			else
			{
				//this is a sanity check because it should be never reached, checkAction() will throw an exception first
				throw new BgaUserException( self::_("server::trySwapTile() active player is neither attacker or defender") );
			}
			
			//calculate the combat bonus for the swapping tile
			$current_player_deck = $this->player_decks[$current_player_id];
			$swap_tile_pips = $this->getTilePipsFromId($swap_tile_id, $current_player_deck);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "trySwapTile() swaptile has $swap_tile_pips pips"));
			
			//check there is a valid tile to replace
			$battle_tiles = $current_battle_deck->getCardsInLocation("battle");
			$weakest_tile = $this->getWeakestTile($battle_tiles);
			
			//is the lowest tile lower than our swap tile?
			if($weakest_tile && $weakest_tile["pips"] < $swap_tile_pips)
			{
				//we've found our battle tile to replace
				$current_battle_deck->moveCard($weakest_tile["tile_info"]["id"], "reject");
				$current_player_deck->moveCard($swap_tile_id, "battle");
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "trySwapTile() check4"));
				
				$this->notifyPlayerHandChanged($attacking_player_id);
			}
			else
			{
				//this would be a tile waste so lets refund it and skip their turn
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "trySwapTile() check6"));
				$refund_tile_info = $current_player_deck->getCard($swap_tile_id);
				self::notifyPlayer($current_player_id, 'tileRefund', '', array(
					"refunded_tiles" => [$refund_tile_info],
					"location_from" => "paystack"
				));
			}
		}
		
		$this->playerFinishSwap($current_player_id, $other_player_id);
	}
	
	function playerFinishSwap($current_player_id, $other_player_id)
	{
		//each player only gets 1 opportunity to swap a tile
		//todo: corsair special rules force them to swap second (note they also spy on enemy tiles)
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		$finish_battle = false;
		if($current_player_id == $attacking_player_id)
		{
			$this->incGameStateValue("attacker_battle_swaps", 1);
		}
		else
		{
			$this->incGameStateValue("defender_battle_swaps", 1);
		}
		
		$this->gamestate->nextState('nextBattleTile');
	}
	
	function findBattle()
	{
		$pending_battle_provinces = $this->GetPendingBattleProvincesAll();
		self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($pending_battle_provinces,true)));
	}
	
	function tryStartBattle($battling_province_name)
	{
		//check if this action is allowed by the active player
		self::checkAction('action_startBattle');
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::tryStartBattle($battling_province_name)"));
		
		//safety check to make sure a battle is possible here
		$province_armies = $this->GetArmiesInProvinceFromProvName($battling_province_name);
		$active_player_present = false;
		$other_player_present = false;
		$active_player_id = $this->getActivePlayerId();
		foreach($province_armies as $army_id => $army)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army,true)));
			if($army["player_id"] == $active_player_id)
			{
				$active_player_present = true;
			}
			else //if($army["player_id"] != $active_player_id)
			{
				//we dont need to know the exact defender, just any enemy army will do
				$other_player_present = true;
			}
			
			if($active_player_present && $other_player_present)
			{
				break;
			}
		}
		
		if(!$active_player_present)
		{
			//throw new BgaSystemException("Only the active player is allowed to start battles.");
			self::notifyAllPlayers("debug", "", array('debugmessage' => "ERROR: server::tryStartBattle($battling_province_name) the active player is not present"));
			return;
		}
		
		if(!$other_player_present)
		{
			//throw new BgaSystemException("There are no enemy players to fight in $battling_province_name");
			self::notifyAllPlayers("debug", "", array('debugmessage' => "ERROR: server::tryStartBattle($battling_province_name) there is no other (non-active) player present to fight"));
			return;
		}
		
		//self::getCollectionFromDb("SELECT player_id id, player_score score, player_no no, player_color color FROM player");
		
		//determine who is the attacker and defender for this battle
		//we considered whether there are edge cases in the rules where the attacker wont be the active player (eg through withdrawal)
		//however there is a ruling that the attacker can only ever be the active player
		$attacking_player_id = $active_player_id;
		$this->setGameStateValue("attacking_player_id", $attacking_player_id);
		$defending_player_id = $this->getDefenderId($battling_province_name, $attacking_player_id);
		$this->setGameStateValue("defending_player_id", $defending_player_id);
		
		//save the battling prov id, this is needed later
		$battling_province_id = $this->getProvinceIdFromName($battling_province_name);
		$this->setGameStateValue("battling_province_id", $battling_province_id);
		
		$province_type_name = $this->GetProvinceTypeName($battling_province_id);
		$stat_name = null;
		switch($province_type_name)
		{
			case "Plains":
			{
				$stat_name = "battles_plains";
				break;
			}
			case "Forest":
			{
				$stat_name = "battles_forest";
				break;
			}
			case "Hills":
			{
				$stat_name = "battles_hills";
				break;
			}
			case "Mountains":
			{
				$stat_name = "battles_mountains";
				break;
			}
			case "Desert":
			{
				$stat_name = "battles_desert";
				break;
			}
			case "Sea":
			{
				$stat_name = "battles_sea";
				break;
			}
		}
		if($stat_name)
		{
			$this->incStat(1, $stat_name);
		}
		
		self::notifyAllPlayers("showMessage", clienttranslate('${player_name1} has attacked ${player_name2}!'), array(
			'type' => "info",
			'player_name1' => $this->getPlayerNameById($attacking_player_id),
			'player_name2' => $this->getPlayerNameById($defending_player_id),
			));
		
		//next, give the defender the option to withdraw
		$this->gamestate->nextState('setupWithdraw');
		
		//transitioning state will call st_setupWithdraw() so follow the game logic there
	}
	
	function GetPendingBattleProvincesAll($target_player_id = -1)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPendingBattleProvincesAll($target_player_id)"));
		if($target_player_id <= 0)
		{
			$target_player_id = $this->getGameStateValue("attacking_player_id");
		}
		if($target_player_id <= 0)
		{
			$target_player_id = self::getActivePlayerId();
		}
		
		if($target_player_id > 0)
		{
			//battles can only be started by the player during their playerTurn
			//note: the active player won't always be the battle instigator
			return $this->GetPendingBattleTilesPlayer($target_player_id);
		}
		
		return [];
	}
	
	function getDefenderId($battle_province_name, $attacker_id)
	{
		$defending_player_id = 0;
		$defender_faction_id = 99999999;
		
		//on the rare chance there are multiple factions in a province, then the current "defender" will always be the one with the lowest faction id that isnt the main player
		//loop over armies in this province
		$battling_armies = $this->GetArmiesInProvinceFromProvName($battle_province_name);
		foreach($battling_armies as $check_army_id => $check_army)
		{
			$check_player_id = $check_army["player_id"];
			if($check_player_id == $attacker_id)
			{
				continue;
			}
			
			//get the faction id for this player
			$check_faction_id = $this->getPlayerFactionId($check_player_id);
			
			//is it a higher priority to be defender?
			if($check_faction_id < $defender_faction_id)
			{
				$defending_player_id = $check_player_id;
				$defender_faction_id = $check_faction_id;
			}
		}
		
		return $defending_player_id;
	}
	
	function GetPendingBattleTilesPlayer($target_player_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::GetPendingBattleTilesPlayer($target_player_id)"));
		
		//lets assume the target_player_id is the attacker
		//i think this is safe because we can also assume that only the active player can initiatie battles (eg attack)
		$pending_battle_provinces = [];
		
		//get all tiles for this player on the map
		$target_player_tiles_by_province = $this->GetPlayerTileInfosByProvince($target_player_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "target_player_tiles_by_province:"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($target_player_tiles_by_province, true)));
		
		$target_player_provinces = array_keys($target_player_tiles_by_province);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "target_player_provinces:"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($target_player_provinces, true)));
		
		//next we will iterate over all players and check for a pending battle 1 player at a time
		$player_ids =  array_keys($this->loadPlayersBasicInfos());  
		foreach($player_ids as $cur_player_id)
		{
			if($cur_player_id == $target_player_id)
			{
				continue;
			}
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "cur_player_id:$cur_player_id"));
			
			//get this player's tiles
			$cur_player_tiles_by_province = $this->GetPlayerTileInfosByProvince($cur_player_id);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "cur_player_tiles_by_province:"));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($cur_player_tiles_by_province, true)));
			
			//iterate over all tiles and check for a collision
			foreach($cur_player_tiles_by_province as $prov_name => $cur_player_tile_infos)
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking cur_player prov_name:$prov_name"));
				if(in_array($prov_name, $target_player_provinces))
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "found"));
					//we found a pending battle so lets record it
					$target_player_tile_infos = $target_player_tiles_by_province[$prov_name];
					$pending_battle_provinces[$prov_name][$target_player_id] = $target_player_tile_infos;
					
					$pending_battle_provinces[$prov_name][$cur_player_id] = $cur_player_tile_infos;
				}
				else
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "not found"));
				}
			}
		}
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($pending_battle_provinces, true)));
		return $pending_battle_provinces;
	}
	
	function GetPendingBattleProvincesPlayer($target_player_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "WARNING! obsolete server::GetPendingBattleProvincesPlayer($target_player_id)"));
		//note: this function is from the perspective of the player_id that is passed in
		//make sure that player is actually a valid attacker!
		
		$unchecked_armies = $this->GetAllArmies();
		$pending_battle_provinces = [];
		$armies_by_province = [];
		
		//first, sort all the armies by province
		foreach($unchecked_armies as $army_id_string => $cur_army)
		{
			$cur_prov_name = $cur_army["prov_name"];
			$armies_by_province[$cur_prov_name][] = $cur_army;
		}
		
		//second, check each province for a battle with this target player
		foreach($armies_by_province as $cur_prov_name => $cur_province_armies)
		{
			$battle_with_target_player = false;
			$defending_player_id = 0;
			$defending_faction_id = 0;
			foreach($cur_province_armies as $cur_army_id => $cur_army)
			{
				$cur_player_id = $cur_army["player_id"];
				
				if($cur_player_id == $target_player_id)
				{
					$battle_with_target_player = true;
				}
				else
				{
					$cur_faction_id = $this->getPlayerFactionId($cur_player_id);
					if($defending_player_id == 0 || $cur_faction_id < $defending_faction_id)
					{
						//in case there are multiple possible battles, the priority order for defender will always be the lowest faction id
						$defending_player_id = $cur_player_id;
						$defending_faction_id = $cur_faction_id;
					}
				}
			}
			
			$battle_with_target_player_string = $battle_with_target_player ? "true" : "false";
			if($battle_with_target_player && $defending_player_id != 0)
			{
				//there is a valid battle here
				$pending_battle_provinces[$cur_prov_name] = [];
				$pending_battle_provinces[$cur_prov_name]["armies"] = $cur_province_armies;
				$pending_battle_provinces[$cur_prov_name]["attacking_player_id"] = $target_player_id;
				$pending_battle_provinces[$cur_prov_name]["defending_player_id"] = $defending_player_id;
			}
		}
		
		return $pending_battle_provinces;
	}
	
	function getNextSwapPlayer($attacking_player_id, $defending_player_id)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::getNextSwapPlayer($attacking_player_id, $defending_player_id)"));
		
		//how many swaps have already happened?
		$attacker_battle_swaps = $this->getGameStateValue("attacker_battle_swaps");
		$defender_battle_swaps = $this->getGameStateValue("defender_battle_swaps");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "attacker_battle_swaps:$attacker_battle_swaps, defender_battle_swaps:$defender_battle_swaps"));
		
		//have we reached max tile swaps?
		$max_swaps = 1;
		if($attacker_battle_swaps >= $max_swaps && $defender_battle_swaps >= $max_swaps)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "battle is finished"));
			return 0;
		}
		
		//who should swap next?
		if($defender_battle_swaps > $attacker_battle_swaps)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "attacker is next"));
			return $attacking_player_id;
		}
		else if($defender_battle_swaps < $attacker_battle_swaps)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "defender is next"));
			return $defending_player_id;
		}
		
		//if neither person has swapped, special handling for who swaps first
		if(self::getUniqueValueFromDB("SELECT player_factionid FROM player WHERE player_id='$attacking_player_id'") == self::FACTION_CORSAIRS)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "CORSAIRS playing... defender first swap"));
			return $defending_player_id;
		}
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "attacker default first swap"));
		
		//default to the attacker swapping first
		return $attacking_player_id;
	}
	
	function getWeakestTile($battle_tiles)
	{
		if(count($battle_tiles) > 0)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "trySwapTile() check3"));
			$lowest_pips = 99;
			$lowest_tile_info = null;
			
			foreach($battle_tiles as $index => $battle_tile_info)
			{
				$cur_battle_pips = $this->getTilePipsFromInfo($battle_tile_info);
				if($cur_battle_pips < $lowest_pips || $lowest_tile_info == null)
				{
					$lowest_pips = $cur_battle_pips;
					$lowest_tile_info = $battle_tile_info;
				}
			}
			
			return ["tile_info" => $lowest_tile_info, "pips" => $lowest_pips];
		}
		
		return null;
	}
	
	public function getBattleWinner()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::getBattleWinner()"));
		
		//get some useful info
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		
		$attacker_dice_tiles = $this->attacker_dice_deck->getCardsInLocation("battle");
		$defender_dice_tiles = $this->defender_dice_deck->getCardsInLocation("battle");
		
		$attacker_player_deck = $this->player_decks[$attacking_player_id];
		$defender_player_deck = $this->player_decks[$defending_player_id];
		$attacker_swap_tiles = $attacker_player_deck->getCardsInLocation("battle");
		$defender_swap_tiles = $defender_player_deck->getCardsInLocation("battle");
		
		$prov_id = $this->getGameStateValue("battling_province_id");
		$prov_name = $this->getProvinceName($prov_id);
		
		//determine the winner
		$attacker_final_score = 0;
		$defender_final_score = 0;
		
		//the "dice" tiles
		foreach ($attacker_dice_tiles as $index => $tile_info)
		{
			$attacker_final_score += $this->getTileCombatBonus($tile_info["type_arg"], $attacking_player_id, true);
		}
		foreach ($defender_dice_tiles as $index => $tile_info)
		{
			$defender_final_score += $this->getTileCombatBonus($tile_info["type_arg"], $defending_player_id, false);
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "combat score check 1, attacker:$attacker_final_score defender:$defender_final_score"));
		
		//player swap tiles
		foreach ($attacker_swap_tiles as $index => $tile_info)
		{
			$attacker_final_score += $this->getTilePipsFromInfo($tile_info, true);
		}
		foreach ($defender_swap_tiles as $index => $tile_info)
		{
			$defender_final_score += $this->getTilePipsFromInfo($tile_info, true);
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "combat score check 2, attacker:$attacker_final_score defender:$defender_final_score"));
		
		//get all attacking armies in the province
		$armies = $this->GetArmiesInProvinceFromProvName($prov_name);
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking attacker armies"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($armies,true)));
		
		foreach($armies as $army_id => $army_info)
		{
			//get all tiles in this army
			$army_tiles = $attacker_player_deck->getCardsInLocation('army', $army_id);
			
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "army_id:$army_id"));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army_tiles,true)));
			
			//add their battle score
			foreach($army_tiles as $index => $tile_info)
			{
				$army_tile_combat_bonus = $this->getTileCombatBonus($tile_info["type_arg"], $attacking_player_id, true);
				$type_arg = $tile_info["type_arg"];
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "type_arg:$type_arg, army_tile_combat_bonus:$army_tile_combat_bonus, attacking_player_id:$attacking_player_id"));
				$attacker_final_score += $army_tile_combat_bonus;
			}
		}
		
		//get all defending armies in the province
		$armies = $this->GetArmiesInProvinceFromProvName($prov_name);
		$defender_shield_tiebreaker = false;
		$numtypes = 13;
		foreach($armies as $army_id => $army_info)
		{
			//get all tiles in this army
			$army_tiles = $defender_player_deck->getCardsInLocation('army', $army_id);
			
			//add their battle score
			foreach($army_tiles as $index => $tile_info)
			{
				$defender_final_score += $this->getTileCombatBonus($tile_info["type_arg"], $defending_player_id, false);
				
				//check if this is a shield unit, it will be a tiebreaker in case of ties
				$base_type = intval($tile_info["type_arg"]) % $numtypes;
				if($base_type == 4)
				{
					$defender_shield_tiebreaker = true;
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "found a shield unit in defender army, tiebreaker will apply"));
				}
			}
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "combat score check 3, attacker:$attacker_final_score defender:$defender_final_score"));
		
		//finally determine the winner
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server final battle scores are: attacker($attacker_final_score) defender($defender_final_score)"));
		$winner_id = 0;
		
		if($defender_final_score > $attacker_final_score)
		{
			$winner_id = $defending_player_id;
		}
		else if($defender_final_score < $attacker_final_score)
		{
			$winner_id = $attacking_player_id;
		}
		else if($defender_shield_tiebreaker)
		{
			$winner_id = $defending_player_id;
			$this->setGameStateValue("last_battle_winner", $defending_player_id);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "defender wins tiebreaker (shield)"));
		}
		else
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "unable to determine tiebreaker"));
		}
		
		return $winner_id;
	}
	
	function getLastBattleWinner()
	{
		return $this->getGameStateValue("last_battle_winner");
	}
	
	function getLastBattleLoser()
	{
		$last_battle_winner = $this->getGameStateValue("last_battle_winner");
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		
		if($last_battle_winner == $attacking_player_id)
		{
			return $defending_player_id;
		}
		else if($last_battle_winner == $defending_player_id)
		{
			return $attacking_player_id;
		}
		
		return 0;
	}
	
	function getLastBattleWinnerPlayerName()
	{
		$player_id = $this->getLastBattleWinner();
		if(!$player_id)
		{
			return "NA_PLAYER";
		}
		return $this->getPlayerNameById($player_id);
	}
	
	function getLastBattleLoserPlayerName()
	{
		$player_id = $this->getLastBattleLoser();
		return $this->getPlayerNameById($player_id);
	}
	
	function isAttackingWinnerDragonriders()
	{
		$winning_player_id = $this->getLastBattleWinner();
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$winning_faction_id = $this->GetPlayerFaction($winning_player_id);
		$status = ($winning_player_id == $attacking_player_id && $winning_faction_id == self::FACTION_DRAGONRIDERS);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::isAttackingWinnerDragonriders() status:$status | winning_player_id:$winning_player_id | attacking_player_id:$attacking_player_id | winning_faction_id:$winning_faction_id"));
		return $status;
	}
	
	function isWinnerNecromancers()
	{
		$player_id = $this->getLastBattleWinner();
		$faction_id = $this->GetPlayerFaction($player_id);
		return ($faction_id == self::FACTION_NECROMANCERS);
	}
	
	function drawDice()
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::drawDice()"));
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		$battling_province_name = $this->getProvinceName($this->getGameStateValue("battling_province_id"));

		//how many tiles should be drawn? 
		$num_attacker_tiles = 3;
		$num_defender_tiles = 3;
		
		//first, check which player has a larger army (default rule)
		
		//calculate total attacker army size
		$attacker_armies = $this->GetPlayerArmiesInProvinceFromProvName($attacking_player_id, $battling_province_name);
		$attacker_army_size = 0;
		$attacker_army_deck = $this->player_decks[$attacking_player_id];
		foreach($attacker_armies as $check_army_id => $check_army)
		{
			$army["tiles"] = $attacker_army_deck->getCardsInLocation('army', $check_army_id);
			$attacker_army_size += count($army["tiles"]);
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "attacker_army_size:$attacker_army_size"));
		
		//calculate total defender army size
		$defender_armies = $this->GetPlayerArmiesInProvinceFromProvName($defending_player_id, $battling_province_name);
		$defender_army_size = 0;
		$defender_army_deck = $this->player_decks[$defending_player_id];
		foreach($defender_armies as $check_army_id => $check_army)
		{
			$army["tiles"] = $defender_army_deck->getCardsInLocation('army', $check_army_id);
			$defender_army_size += count($army["tiles"]);
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "defender_army_size:$attacker_army_size"));
		
		//compare the two
		if($attacker_army_size > $defender_army_size)
		{
			$num_attacker_tiles = 4;
			self::notifyAllPlayers("debug", "", array('debugmessage' => "attacker army is larger, their tile count set to 4), attacker $attacker_army_size vs defender $defender_army_size"));
		}
		else if($attacker_army_size < $defender_army_size)
		{
			$num_defender_tiles = 4;
			self::notifyAllPlayers("debug", "", array('debugmessage' => "defender army is larger, their tile count set to 4), attacker $attacker_army_size vs defender $defender_army_size"));
		}
		
		//second, check if the hill folk are playing in the battle (special rule)
		$hillfolk_armies = array();
		$attacker_is_hillfolk = false;
		$attacker_faction_id = (int)$this->getPlayerFactionId($attacking_player_id);
		$defender_faction_id = (int)$this->getPlayerFactionId($defending_player_id);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "attacker_faction_id: " . $attacker_faction_id . ", defender_faction_id: " . $defender_faction_id));
		if($attacker_faction_id == self::FACTION_HILLFOLK)
		{
			$attacker_is_hillfolk = true;
			$hillfolk_armies = $attacker_armies;
		}
		else if($defender_faction_id == self::FACTION_HILLFOLK)
		{
			$hillfolk_armies = $defender_armies;
		}
		
		//now check if the hill folk armies contain a giant
		foreach($hillfolk_armies as $check_army_id => $check_army)
		{
			if($this->isGiantPresent($check_army))
			{
				if($attacker_is_hillfolk)
				{
					$num_attacker_tiles = 4;
					self::notifyAllPlayers("debug", "", array('debugmessage' => "hill folk attacker has a giant, their tile count set to 4)"));
				}
				else
				{
					$num_defender_tiles = 4;
					self::notifyAllPlayers("debug", "", array('debugmessage' => "hill folk defender has a giant, their tile count set to 4)"));
				}
				break;
			}
		}
		
		//draw the random battle tiles for each player
		//make sure to shuffle beforehand
		//pickCardsForLocation( $nbr, $from_location, $to_location, $location_arg=0, $no_deck_reform=false )
		$this->attacker_dice_deck->shuffle('deck');
		$attacker_battle_tiles = $this->attacker_dice_deck->pickCardsForLocation($num_attacker_tiles, "deck", "battle");
		$this->defender_dice_deck->shuffle('deck');
		$defender_battle_tiles = $this->defender_dice_deck->pickCardsForLocation($num_defender_tiles, "deck", "battle");
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "attacker tiles: " . count($attacker_battle_tiles) . " defender tiles: " . count($defender_battle_tiles)));
		
		//max of 3 contribute to battlescore, so if a player has >3 then move the lowest to the reject pile
		//there should never be more than 4 (game rules) so we only need to move one
		if($num_attacker_tiles > 3)
		{
			//this should always return a value (i hope)
			$weakest_tile = $this->getWeakestTile($attacker_battle_tiles);
			$this->attacker_dice_deck->moveCard($weakest_tile["tile_info"]["id"], "reject");
		}
		if($num_defender_tiles > 3)
		{
			//this should always return a value (i hope)
			$weakest_tile = $this->getWeakestTile($defender_battle_tiles);
			$this->defender_dice_deck->moveCard($weakest_tile["tile_info"]["id"], "reject");
		}
	}
	
	public function resetAfterTie()
	{
		$this->setGameStateValue("attacker_battle_swaps",0);
		$this->setGameStateValue("defender_battle_swaps",0);
		
		//reset the attacker dice tiles
		$this->attacker_dice_deck->moveAllCardsInLocation("battle","deck");
		$this->attacker_dice_deck->moveAllCardsInLocation("reject","deck");
		
		//reset the defender dice tiles
		$this->defender_dice_deck->moveAllCardsInLocation("battle","deck");
		$this->defender_dice_deck->moveAllCardsInLocation("reject","deck");
		
		//reset any player swapped tiles
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$this->player_decks[$attacking_player_id]->moveAllCardsInLocation("battle","discard");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		$this->player_decks[$defending_player_id]->moveAllCardsInLocation("battle","discard");
	}
	
	function sacrificeRandomUnit()
	{
		$losing_player = $this->getGameStateValue("last_battle_loser");
		$losing_player_deck = $this->player_decks[$losing_player];
		$battling_province_id = $this->getGameStateValue("battling_province_id");
		$province_name = $this->getProvinceName($battling_province_id);
		$armies = $this->GetPlayerArmiesInProvinceFromProvName($losing_player, $province_name);
		foreach($armies as $army_id => $army)
		{
			//destroy the first one we find
			$tiles = $player_deck->getCardsInLocation('army', $source_army_id);
			foreach($tiles as $card_id => $tileinfo)
			{
				$this->sacrificeUnit($card_id);
				return;
			}
		}
	}
	
	function sacrificeUnit($sacrifice_tile_id)
	{
		self::notifyAllPlayers("debug", "", array('debugmessage' => "server::sacrificeUnit($sacrifice_tile_id) gettype:" . gettype($sacrifice_tile_id)));
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		$active_player_id = $this->getActivePlayerId();
		$losing_player_deck = null;
		$losing_player_id;
		$losing_player_name;
		if($active_player_id == $attacking_player_id)
		{
			$losing_player_deck = $this->player_decks[$attacking_player_id];
			$losing_player_name = $this->getPlayerNameById($attacking_player_id);
			$losing_player_id = $attacking_player_id;
		}
		else if($active_player_id == $defending_player_id)
		{
			$losing_player_deck = $this->player_decks[$defending_player_id];
			$losing_player_name = $this->getPlayerNameById($defending_player_id);
			$losing_player_id = $defending_player_id;
		}
		else
		{
			//sanity check
			throw new BgaUserException( self::_("sacrificeUnit($sacrifice_tile_id) unknown player!") );
		}
		
		//first get some info about this tile
		$tile_info = $losing_player_deck->getCard($sacrifice_tile_id);
		self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tile_info, true)));
		
		//move it into the discard pile
		$losing_player_deck->moveCard($sacrifice_tile_id, "discard");
		
		//update all the client UIs
		$sacrifice_army_id = $tile_info['location_arg'];
		$sacrifice_army_id_string = $this->GetArmyIdStringFromElements($sacrifice_army_id, $losing_player_id);
		self::notifyAllPlayers("tileSacrifice", clienttranslate('${player_name} has sacrificed ${tile_name} while retreating'), array(
			'player_name' => $losing_player_name,
			'tile_name' => $this->getTileNameFromType($tile_info["type_arg"]),
			'sacrifice_tile_id' => $sacrifice_tile_id,
			'sacrifice_army_id_string' => $sacrifice_army_id_string
			));
		
		//if this is a citadel, special handle it
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking if sacrifice tile is a citadel..."));
		$sacrifice_tile_type = $tile_info['type_arg'];
		if($this->isTileTypeCitadel($sacrifice_tile_type))
		{
			$this->PlayerCaptureCitadel($attacking_player_id, $defending_player_id);
		}
		
		//handle special post retreat abilities
		if($this->isWinnerNecromancers())
		{
			//if a necromancer is present in the winning force, we will spawn 1 undead tile
			
			//get all winning armies in the province
			$winning_player_id = $this->getLastBattleWinner();
			$prov_name = $this->getProvinceName($this->getGameStateValue("battling_province_id"));
			$armies = $this->GetPlayerArmiesInProvinceFromProvName($winning_player_id, $prov_name);
			
			//loop over all of these armies
			$necromancer_found = false;
			foreach($armies as $army_id => $army_info)
			{
				//did this army have a necromancer? we only need 1
				if($this->isNecromancerPresent($army_info))
				{
					$necromancer_found = true;
					break;
				}
			}
			
			if($necromancer_found)
			{
				//now we will create a new undead tile!
				$undead_tile_ids = [$this->createNewZombieTile()];
				$new_army = $this->createArmy($prov_name, $winning_player_id, $undead_tile_ids);
				
				//get the info from this newly created army with its lone undead
				/*$undead_army = [
					"army_id" => $new_army["id_num"],
					"province_id" => $prov_name,
					"player_id" => $winning_player_id,
					"tiles" => $new_army["tiles"],
				];*/
				
				//send this info to the player
				self::notifyAllPlayers("battleResolve_undead", clienttranslate('The necromancers of ${player_name} have raised the corpses of the slain!'), array(
					'player_name' => $this->getLastBattleWinnerPlayerName(),
					'undead_army' => $new_army));
			}
			else
			{
				//no necromancer present
				$this->notifyPlayer($winning_player_id, 'showMessage', clienttranslate('No undead were raised after your victory because you had no necromancers present.'), []);
			}
		}
		else if($this->isAttackingWinnerDragonriders())
		{
			//any attacking dragons "fly away" and despawn after a successful attack
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "check1"));
			$dragon_tiles = [];
			$prov_name = $this->getProvinceName($this->getGameStateValue("battling_province_id"));
			$armies = $this->GetPlayerArmiesInProvinceFromProvName($attacking_player_id, $prov_name);
			$player_deck = $this->player_decks[$attacking_player_id];
			
			//get all attacking armies in the province
			foreach($armies as $army_id => $army_info)
			{
				//get all tiles in this army
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "army $army_id"));
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army_info,true)));
				$army_tiles = $player_deck->getCardsInLocation('army', $army_id);
				
				//loop over all the tiles in this army
				foreach($army_tiles as $index => $tile_info)
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tile_info,true)));
					$tile_type = $tile_info["type_arg"];
					if($this->isTileTypeDragon($tile_type))
					{
						$tile_id = $tile_info["id"];
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "dragon found tile_id:$tile_id, discarding"));
						//sort the tile ids by army id for easier access on the client
						if(!array_key_exists($army_id, $dragon_tiles))
						{
							$dragon_tiles[$army_id] = [];
						}
						$dragon_tiles[$army_id][] = $tile_id;
						
						//despawn that dragon by moving the tile discard
						$player_deck->moveCard($tile_id, "discard");
					}
				}
				
				//if there are no tiles left in the army, destroy that army
				$army_tiles = $player_deck->getCardsInLocation('army', $army_id);
				$tilesleft = count($army_tiles);
				if($tilesleft == 0)
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "deleting empty army $army_id"));
					$army_id_string = $this->GetArmyIdStringFromElements($army_id, $attacking_player_id);
					$this->DeleteArmyByIdString($army_id_string);
					//$this->DeleteArmy($army_id);
				}
				else
				{
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "army $army_id has tilesleft:$tilesleft"));
				}
			}
			if(count($dragon_tiles) > 0)
			{
				self::notifyAllPlayers("battleResolve_dragons", clienttranslate('The victorious attacking dragon(s) belonging to ${player_name} have flown away.'), array(
					'player_name' => $this->getLastBattleWinnerPlayerName(),
					'dragon_tiles' => $dragon_tiles));
			}
		}
		
		//if there are no tiles left in the army, destroy that army
		$army_tiles = $losing_player_deck->getCardsInLocation('army', $sacrifice_army_id);
		if(count($army_tiles) == 0)
		{
			$army_id_string = $this->GetArmyIdStringFromElements($sacrifice_army_id, $losing_player_id);
			$this->DeleteArmyByIdString($army_id_string);
			//$this->DeleteArmy($sacrifice_army_id);
			
			//there are no armies to retreat, so go straight to cleanup
			$this->gamestate->nextState('battleCleanup');
		}
		else
		{
			//now move to the retreat phase
			$this->gamestate->nextState('retreat');
		}
	}
}
