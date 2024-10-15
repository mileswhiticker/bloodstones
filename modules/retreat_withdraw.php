
<?php

const WITHDRAW_SUCCESS = 0;
const WITHDRAW_SUCCESS_CAVALRY = 1;
const WITHDRAW_SUCCESS_DRAGON = 2;
const WITHDRAW_SUCCESS_MAX = 2;
const WITHDRAW_FAIL_DRAGON = 3;
const WITHDRAW_FAIL_CAVALRY = 4;
const WITHDRAW_FAIL_CORSAIR = 5;
const WITHDRAW_FAIL_CITADEL = 6;
const WITHDRAW_FAIL_CASTLE = 7;

trait retreat_withdraw
{
	function isWithdrawAllowed($withdraw_status)
	{
		if($withdraw_status <= WITHDRAW_SUCCESS_MAX)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::isWithdrawAllowed($withdraw_status) returning true"));
			return true;
		}
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::isWithdrawAllowed($withdraw_status) returning false"));
		return false;
	}
	
	function calculateWithdrawStatus()
	{
		self::notifyAllPlayers("debug", "", array('debugmessage' => "server::calculateWithdrawStatus()"));
		
		//get some useful info we will need
		$battling_province_id = $this->getGameStateValue("battling_province_id");
		$battling_province_name = $this->getProvinceName($this->getGameStateValue("battling_province_id"));
		
		$attacking_player_id = $this->getGameStateValue("attacking_player_id");
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		
		$attacker_armies = $this->GetPlayerArmiesInProvinceFromProvName($attacking_player_id, $battling_province_name);
		$defender_armies = $this->GetPlayerArmiesInProvinceFromProvName($defending_player_id, $battling_province_name);
		
		$defender_deck = $this->player_decks[$defending_player_id];
		$attacker_deck = $this->player_decks[$attacking_player_id];
		
		$num_tile_types = 13;
		
		//loop over defender army to check withdraw conditions
		$num_defender_cavalry = 0;
		foreach($defender_armies as $army_id => $army)
		{
			$tiles = $defender_deck->getCardsInLocation("army", $army_id);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "defender army:"));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tiles, true)));
			foreach($tiles as $tile_id => $tile_info)
			{
				$tile_type = (int)$tile_info['type_arg'];
				$base_type = $this->getBaseTileType($tile_type);
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking tile_type:$tile_type, base_type:$base_type"));
				
				//citadels
				if($this->isTileTypeCitadel($tile_type))
				{
					self::notifyAllPlayers("debug", "", array('debugmessage' => "WITHDRAW_FAIL_CITADEL"));
					return WITHDRAW_FAIL_CITADEL;
				}
				
				//castles
				if($this->isTileTypeCastle($tile_type))
				{
					self::notifyAllPlayers("debug", "", array('debugmessage' => "WITHDRAW_FAIL_CASTLE"));
					return WITHDRAW_FAIL_CASTLE;
				}
				
				//dragons
				if($this->isTileTypeDragon($tile_type))
				{
					self::notifyAllPlayers("debug", "", array('debugmessage' => "WITHDRAW_SUCCESS_DRAGON"));
					return WITHDRAW_SUCCESS_DRAGON;
				}
				
				//cavalry
				if($this->isTileTypeCavalry($tile_type))
				{
					$num_defender_cavalry = $num_defender_cavalry + 1;
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "adding cavalry"));
				}
			}
		}
		
		//loop over attacker army to check withdraw conditions
		$num_attacker_cavalry = 0;
		foreach($attacker_armies as $army_id => $army)
		{
			$tiles = $attacker_deck->getCardsInLocation("army", $army_id);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "attacker army:"));
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tiles, true)));
			foreach($tiles as $tile_id => $tile_info)
			{
				$tile_type = (int)$tile_info['type_arg'];
				//$base_type = $this->getBaseTileType($tile_type);
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking tile_type:$tile_type, base_type:$base_type"));
				
				//dragons
				if($this->isTileTypeDragon($tile_type))
				{
					self::notifyAllPlayers("debug", "", array('debugmessage' => "WITHDRAW_FAIL_DRAGON"));
					return WITHDRAW_FAIL_DRAGON;
				}
				
				//cavalry
				if($this->isTileTypeCavalry($tile_type))
				{
					$num_attacker_cavalry = $num_attacker_cavalry + 1;
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "adding cavalry"));
				}
			}
		}
		
		//compare the cavalry
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "final check. num_defender_cavalry:$num_defender_cavalry, num_attacker_cavalry:$num_attacker_cavalry"));
		if($num_defender_cavalry < $num_attacker_cavalry)
		{
			self::notifyAllPlayers("debug", "", array('debugmessage' => "WITHDRAW_FAIL_CAVALRY"));
			return WITHDRAW_FAIL_CAVALRY;
		}
		else if($num_attacker_cavalry > 0)
		{
			//the attacker has some cavalry but not enough to prevent defender withdrawing
			//send a nice helpful message to the players about the usefulness of cavalry
			return WITHDRAW_SUCCESS_CAVALRY;
		}
		else
		{
			//corsair ship attack: if attacker is corsair and has a ship adjacent, defender can only retreat if they have at least 1 cavalry
			if($this->GetPlayerFaction($attacking_player_id) == self::FACTION_CORSAIRS)
			{
				//todo
				self::notifyAllPlayers("debug", "", array('debugmessage' => "TODO: server::isWithdrawAllowed() does attacking corsair player have ships adjacent here?"));
				
				//loop over adjacent provinces to look for a ship
				$all_provinces = $this->getAllProvinces();
				$start_prov = $all_provinces[$battling_province_id];
				foreach($start_prov["movement_links"] as $linked_prov_id)
				{
					$linked_prov = $all_provinces[$linked_prov_id];
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking prov:$linked_prov_id"));
					//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($linked_prov,true)));
					
					//dont bother checking if it's not a sea province
					if($linked_prov["type"] != "Sea")
					{
						continue;
					}
					
					//check all armies in this sea province
					$linked_prov_name = $this->getProvinceName($linked_prov_id);
					$armies = $this->GetPlayerArmiesInProvinceFromProvName($attacking_player_id, $linked_prov_name);
					foreach($armies as $army_id => $army)
					{
						//check all tiles in this army looking for a ship (note: there is 100% chance of it being a ship but lets be thorough as a sanity check)
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking army_id:$army_id"));
						$tiles = $attacker_deck->getCardsInLocation("army", $army_id);
						foreach($tiles as $tile_id => $tile_info)
						{
							$tile_type = (int)$tile_info['type_arg'];
							$base_type = $this->getBaseTileType($tile_type);
							//self::notifyAllPlayers("debug", "", array('debugmessage' => "checking tile_type:$tile_type, base_type:$base_type"));
							
							//is this a ship? we only need one
							if($base_type == 8)
							{
								//self::notifyAllPlayers("debug", "", array('debugmessage' => "WITHDRAW_FAIL_CORSAIR"));
								return WITHDRAW_FAIL_CORSAIR;
							}
						}
					}
				}
			}
		}
		
		//by default allow it to happen
		self::notifyAllPlayers("debug", "", array('debugmessage' => "WITHDRAW_SUCCESS"));
		return WITHDRAW_SUCCESS;
	}
	
	function SendWithdrawPlayerNotification($withdraw_status)
	{
		//sprintf( self::_("First part of the string, %s second part of the string"), $argument )
		/*$withdraw_strings = [
			//_(""),
		];*/
		
		//get the info string to be sent to players about the withdraw status
		$message = 'ERROR: unknown withdraw_status string';
		switch($withdraw_status)
		{
			default:
			{
				//this shouldn't happen so it's just a sanity/debug check
				$message = 'ERROR: ${player_name} unknown retreat status ' . $withdraw_status;
				break;
			}
			case WITHDRAW_SUCCESS:
			{
				$message = clienttranslate('${player_name} can now choose to withdraw or fight.');
				break;
			}
			case WITHDRAW_SUCCESS_CAVALRY:
			{
				$message = clienttranslate('${player_name} can now choose to withdraw or fight due to having more cavalry.');
				break;
			}
			case WITHDRAW_SUCCESS_DRAGON:
			{
				$message = clienttranslate('${player_name} can now choose to withdraw or fight due to their dragon(s).');
				break;
			}
			case WITHDRAW_FAIL_DRAGON:
			{
				$message = clienttranslate('${player_name} cannot withdraw due to the opposing dragon(s).');
				break;
			}
			case WITHDRAW_FAIL_CAVALRY:
			{
				$message = clienttranslate('${player_name} cannot withdraw due to overwhelming opposing cavalry.');
				break;
			}
			case WITHDRAW_FAIL_CORSAIR:
			{
				$message = clienttranslate('${player_name} cannot withdraw due to the presence of a Corsair raiding fleet.');
				break;
			}
			case WITHDRAW_FAIL_CITADEL:
			{
				$message = clienttranslate('${player_name} cannot withdraw from their citadel.');
				break;
			}
			case WITHDRAW_FAIL_CASTLE:
			{
				$message = clienttranslate('${player_name} cannot withdraw from their castle(s).');
				break;
			}
		}
		
		//what is the defender faction name?
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		
		//tell all the players what happened
		$this->notifyAllPlayers('logPlayerMessage', $message,[
			'player_name' => $this->getPlayerNameById($defending_player_id)
		]);
	}
	
	function tryRejectWithdraw()
	{
		self::checkAction('action_rejectWithdraw');
		
		//let the battle begin! 
		$this->gamestate->nextState('setupBattle');
	}
	
	function retreatRandom()
	{
		//work out what possible options we could retreat to
		$losing_player = $this->getLastBattleLoser();
		$battling_province_id = $this->getGameStateValue("battling_province_id");
		$retreat_prov_options = $this->GetProvinceRetreatOptions($battling_province_id, $losing_player);
		
		//pick a random province
		$prov_index = rand(0, count($retreat_prov_options) - 1);
		$move_info = $retreat_prov_options[$prov_index];
		$retreat_prov_name = $move_info["name"];
		
		//handle the rest of the retreat as normal
		$this->tryRetreat($retreat_prov_name);
	}
	
	function tryRetreat($retreat_prov_name)
	{
		self::checkAction('action_retreat');
		
		$this->HandleRetreatWithdraw($retreat_prov_name);
		
		//the battle is finished, so make our last cleanups
		$this->gamestate->nextState('battleCleanup');
	}
	
	function tryWithdraw($retreat_prov_name)
	{
		self::checkAction('action_withdraw');
		
		$this->HandleRetreatWithdraw($retreat_prov_name);
		
		//what is the defender faction name?
		$defending_player_id = $this->getGameStateValue("defending_player_id");
		$defender_faction_name = $this->getPlayerFactionName($defending_player_id);
		
		//tell all the players what happened
		$prov_id = $this->getProvinceIdFromName($retreat_prov_name);
		$province_ui_name = $this->GetProvinceNameUIString($prov_id);
		$this->notifyAllPlayers('logPlayerMessage', clienttranslate('${defender_faction_name} have withdrawn from battle to ${province_ui_name}'), [
			'defender_faction_name' => $defender_faction_name,
			'province_ui_name' => $province_ui_name
		]);
		
		//finally, move on with the battle
		$this->gamestate->nextState('battleCleanup');
	}
	
	function HandleRetreatWithdraw($retreat_prov_name)
	{
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::HandleRetreatWithdraw($retreat_prov_name)"));
		
		//get some info about the provinces
		$battling_province_id = $this->getGameStateValue("battling_province_id");
		$battle_prov_name = $this->getProvinceName($battling_province_id);
		$retreat_prov_id = $this->getProvinceIdFromName($retreat_prov_name);
		$all_provinces = $this->getAllProvinces();
		$prov_type = $this->GetProvinceTypeName($retreat_prov_id);
		
		//get some info about the player
		$retreat_player_id = $this->getLastBattleLoser();
		if($retreat_player_id == 0)
		{
			//this is expected behaviour... players can withdraw before a battle starts so there would be no loser
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "WARNING! server::HandleRetreatWithdraw($retreat_prov_name) but getLastBattleLoser() returned 0"));
			
			$retreat_player_id = $this->getGameStateValue("defending_player_id");
		}
		$retreat_faction_id = $this->GetPlayerFaction($retreat_player_id);
		
		//merge together all retreating armies in this province 
		//$this->MergePlayerArmiesInProvince($retreat_prov_id, $retreat_player_id);
		
		//get some info about the retreating army... there should only be 1 army here
		//you can add LIMIT 1 to the sql call to make it simply select the first row... but it's probably better to throw an exception if there is bad behaviour here so i can find and fix it
		$retreating_army = $this->GetMainPlayerArmyInProvinceFromProvName($retreat_player_id, $battle_prov_name);
		$retreating_army_id = $retreating_army["army_id"];
		$retreating_deck = $this->player_decks[$retreat_player_id];
		$retreating_tiles = $retreating_deck->getCardsInLocation("army", $retreating_army_id);
		
		/*
		array(
		   'id' => ..,          // the card ID
		   'type' => ..,        // the card type
		   'type_arg' => ..,    // the card type argument
		   'location' => ..,    // the card location
		   'location_arg' => .. // the card location argument
		);
		*/
		//check if any retreating tiles are going to die from moving into this province
		//loop over all units in the army to determine move status
		$killed_tiles = [];
		$killed_tile_ids = [];
		$killed_tile_names = [];
		foreach($retreating_tiles as $tile_info)
		{
			$tile_type = intval($tile_info['type_arg']);
			$numtypes = 13;
			$base_type = $tile_type % $numtypes;
			
			$killed = false;
			if($this->isTileTypeCastle($tile_type))
			{
				//castles automatically die because they cant move
				$killed = true;
			}
			else if($this->isTileTypeCitadel($tile_type))
			{
				//citadels automatically die because they cant move
				$killed = true;
			}
			else if(!$this->TileCanMove($tile_type, $prov_type, $retreat_faction_id) ||
				$this->IsTileDangerousProvince($tile_type, $prov_type))
			{
				$killed = true;
			}
			
			if($killed)
			{
				$killed_tiles[] = $tile_info;
				$killed_tile_ids[] = $tile_info['id'];
				$killed_tile_names[] = $this->getTileNameFromType($tile_info['type_arg']);
				
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "killed tile_info:"));
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tile_info, true)));
				
				if($this->isTileTypeCitadel($tile_type))
				{
					$winning_player_id = $this->getLastBattleWinner();
					$this->PlayerCaptureCitadel($winning_player_id, $retreat_player_id);
				}
			}
		}
		$killed_tiles_string = implode(", ", $killed_tile_names);
		
		//move the killed tiles back into the discard pile
		$retreating_deck->moveCards($killed_tile_ids, "discard");
		
		//tell the players if some units died during the retreat/withdraw
		$num_tiles_killed = count($killed_tiles);
		$player_name = $this->getPlayerNameById($retreat_player_id);
		if($num_tiles_killed > 0)
		{
			//increase the statistic
			$this->incStat($num_tiles_killed, "terrain_losses", $retreat_player_id);
			
			//tell the players
			$province_ui_name = $this->GetProvinceNameUIString($retreat_prov_id);
			self::notifyAllPlayers('playerArmyRetreat', clienttranslate('${player_name} loses ${killed_tiles_string} while retreating to ${province_ui_name}'), 
				array(
					'killed_tiles_string' => $killed_tiles_string,
					'player_name' => $player_name,
					'retreating_army_id' => $retreating_army_id,
					'retreat_prov_name' => $retreat_prov_name,
					'killed_tiles' => $killed_tiles,
					'province_ui_name' => $province_ui_name
				));
		}
		
		//if there are survivors, move them into the new province
		$retreating_tiles = $retreating_deck->getCardsInLocation("army", $retreating_army_id);
		if(count($retreating_tiles) > 0)
		{
			$sql_update = "UPDATE armies SET province_id='$retreat_prov_name' WHERE army_id='$retreating_army_id';";
			self::DbQuery($sql_update);
			
			//tell the players where the army moved to
			self::notifyAllPlayers('playerArmyMove', '', array(
				'army_id_num' => $retreating_army_id,
				'pending_battles_update' => $this->GetPendingBattleProvincesAll(),
				'dest_province_id' => $retreat_prov_name
			));
		}
		else
		{
			//delete it from our database
			$this->DeleteArmy($retreating_army_id);
		}
	}
}