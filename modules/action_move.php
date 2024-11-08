<?php

trait action_move
{
	function HandleMoveAction($action_info, $paid_tile_infos, $paid_tile_ids)
	{
		$outcome_info = ["failure_reason" => self::ACTION_FAIL_UNKNOWN];
		
		$current_player_id = $this->getCurrentPlayerId();
		
		//note: this includes army splits as well as moves
		//first, check if the player's move is legal
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::HandleMoveAction()"));
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($action_info, true)));
		if($this->getStateName() != "playerMain")
		{
			$outcome_info = ["failure_reason" => self::ACTION_FAIL_STATE];
			return $outcome_info;
		}
		
		//for testing
		//$outcome_info["failure_reason"] = self::ACTION_SUCCESS;
		//return $outcome_info;
		
		//this is used to update the client
		$tile_moves_client = [];
		
		//this is used to update the server database (via Deck)
		$tile_moves_server = [];
		
		//this is used to check for cleaning up old armies
		$starting_provinces = [];
		
		//this is used to construct the player log message
		$player_deck = $this->player_decks[$current_player_id];
		$tile_moves_strings = [];
		
		//for record stat keeping
		$new_longest_move = 0;
		
		//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($action_info, true)));
		foreach($action_info as $tile_id => $tile_move_steps)
		{
			//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tile_move_steps, true)));
			$end_prov_name = null;
			$start_prov_name = null;
			$cur_move_length = 0;
			foreach($tile_move_steps as $index => $tile_move_step)
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "index:$index"));
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($tile_move_step, true)));
				
				//todo: legality checks here
				//assume this tile moving between these two provinces was a legal move for now
				$end_prov_name = $tile_move_step["end_prov_name"];
				$cur_move_length += 1;
				
				//we only need to know the starting province for this tile, it's likely that there were several intermediate steps as well
				if(!$start_prov_name)
				{
					$start_prov_name = $tile_move_step["start_prov_name"];
				}
			}
			
			//sanity check
			if(!$end_prov_name)
			{
				throw new BgaSystemException("Error! Move action could not determine final province for tile_id $tile_id");
			}
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "tile_id:$tile_id, end_prov_name:$end_prov_name"));
			
			//$destination_army = GetMainPlayerArmyInProvinceFromProvName($current_player_id, $province_name);
			
			//this will be used to update the client and database
			if(!array_key_exists($end_prov_name, $tile_moves_strings))
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "adding $end_prov_name to \$tile_moves_server"));
				$tile_moves_server[$end_prov_name] = [];
				$tile_moves_strings[$end_prov_name] = [];
				$tile_moves_client[$tile_id] = [];
			}
			else
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "$end_prov_name is already in \$tile_moves_server"));
			}
			$tile_move = ['tile_id' => $tile_id, 'start_prov_name' => $start_prov_name, 'end_prov_name' => $end_prov_name];
			$tile_moves_client[$tile_id] = $tile_move;
			
			$tile_moves_server[$end_prov_name][] = $tile_id;
			$tile_moves_strings[$end_prov_name][] = $this->getTileNameFromIdDeck($tile_id, $player_deck);
			$starting_provinces[$start_prov_name] = 1;
			
			//$num = count($tile_moves_server[$end_prov_name]);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "\$tile_moves_server[$end_prov_name] now has $num tiles"));
			
			//for record stat keeping
			if($cur_move_length > $new_longest_move)
			{
				$new_longest_move = $cur_move_length;
			}
		}
		
		//update the record if we need to
		$old_longest_move = $this->getStat("longest_move", $current_player_id);
		if($new_longest_move > $old_longest_move)
		{
			$this->setStat($new_longest_move, "longest_move", $current_player_id);
		}
		
		//update the database
		foreach($tile_moves_server as $move_province_name => $moving_tile_ids)
		{
			$this->MoveTilesToProvinceName($move_province_name, $current_player_id, $moving_tile_ids);
		}
		
		//clear out the old army in this province if its empty
		foreach($starting_provinces as $start_prov_name => $dummyvar)
		{
			$start_prov_id = $this->getProvinceIdFromName($start_prov_name);
			$remaining_tiles = $this->GetPlayerTilesInProvince($start_prov_id, $current_player_id);
			$army_id_string = $this->GetArmyIdStringFromElements($start_prov_id, $current_player_id);
			if(count($remaining_tiles) == 0)
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "after move, i will not delete empty army $army_id_string"));
				$this->DeleteArmyByIdString($army_id_string);
			}
			else
			{
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "after move, i checked $army_id_string but found it isnt empty so i wont delete it"));
			}
		}
		
		// process the tile payment
		$pips_spent = $this->DiscardTilesFromHand($paid_tile_infos, $current_player_id);
		$this->incStat($pips_spent, "pips_move", $current_player_id);
		
		//chaos horde may trigger a recalculation of capturable villages
		if($this->IsCurrentPlayerChaosHorde())
		{
			$this->ChaosHordeMoveUpdate();
		}
		
		//now construct the string telling the client what happened
		$province_info_strings = [];
		foreach($tile_moves_strings as $end_prov_name => $tile_strings)
		{
			$dest_province_num = $this->getProvinceIdFromName($end_prov_name);
			//self::notifyAllPlayers("debug", "", array('debugmessage' => "end_prov_name:$end_prov_name, dest_province_num:$dest_province_num"));
			$province_ui_name = $this->GetProvinceNameUIString($dest_province_num);
			$tile_names_string = implode(", ", $tile_strings);
			$province_info_strings[] = "$tile_names_string -> $province_ui_name.";
		}
		$province_info_string = implode(" ", $province_info_strings);
		
		//update the clients
		$current_player_name = $this->getCurrentPlayerName();
		self::notifyAllPlayers('playerTileMoves', clienttranslate('${player_name} has moved tiles: ${province_info_string}'), array(
			'player_id' => $current_player_id,
			'player_name' => $current_player_name,
			'province_info_string' => $province_info_string,
			'tile_moves' => $tile_moves_client,
			'pending_battles_update' => $this->GetPendingBattleProvincesAll(),
		));
		
		//finished
		$outcome_info["failure_reason"] = self::ACTION_SUCCESS;
		return $outcome_info;
		
		
		
		
		
		
		
		
		
		
		
		//old system
		/*
		//loop over every step to check legality
		foreach($action_info as $army_id_string => $army_action_steps)
		{
			//todo
			break;
		}
		
		//assume that the moves are legal for now
		$success = true;
		
		//army split actions use a temp army id for all following client side steps, we need to record that because this algorithm immediately assigns full ids for any detected temp ids
		$temp_id_map = [];
		if($success)
		{
			$longest_move_length = $this->getStat("longest_move", $current_player_id);
			$army_unit_strings = [];
			foreach($action_info as $army_id_string => $army_action_steps)
			{
				$source_army_id = self::GetArmyIdNumFromString($army_id_string);
				$cur_move_length = 0;
				if($this->isArmyIdTemp($source_army_id))
				{
					$temp_id = $source_army_id;
					if(key_exists($source_army_id, $temp_id_map))
					{
						$source_army_id = $temp_id_map[$source_army_id];
						self::notifyAllPlayers("debug", "", array('debugmessage' => "server::HandleMoveAction() successfully replaced temp army id: $temp_id with assigned army id: $source_army_id"));
					}
					else
					{
						self::notifyAllPlayers("debug", "", array('debugmessage' => "ERROR: server::HandleMoveAction() step with army temp_id:$temp_id could not find matching assigned army id, skipping this army"));
						continue;
					}
				}
				$source_army = $this->GetArmy($source_army_id);
				//$num_steps = count($army_action_steps);
				//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army_action_steps,true)));
				
				$dest_province_name = "NA";
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "$myvar"));
				foreach($army_action_steps as $action_step)
				{
					$action_step_type = $action_step["step_type"];
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "action_step_type: $action_step_type"));
					
					$action_step_prov_name = $action_step["prov_name"];
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "action_step_prov_name: $action_step_prov_name"));
					
					if($action_step_type == self::ACTION_MOVE)
					{
						$cur_move_length += 1;
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "self::ACTION_MOVE,source_army_id:$source_army_id,action_step_prov_name:$action_step_prov_name"));
						//var action_step = {step_type: ACTION_MOVE, prov_name: target_province_info.name};
						//var army_action_steps = this.queued_action_steps[moving_army.id_string];
						//army_action_steps.push(action_step);
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "self::ACTION_MOVE action_step_prov_name:$action_step_prov_name"));
						$dest_province_name = $action_step["prov_name"];
					}
					else if($action_step_type == self::ACTION_SPLIT)
					{
						//if this is a split action, then $source_army will be null because $source_army_id is a temp id for the new temp army
						
						//this is the javascript that is passed in via json
						//var split_step = {step_type: ACTION_SPLIT, prov_name: source_army.province_id, prov_id: split_prov_id, tile_id: cur_tile_id, //temp_army_id_num: temp_army.id_num};
						
						$new_army = self::tryArmyStackTransfer($source_army_id, null, array($action_step["tile_id"]), self::SELECT_ARMY_NONE, 
						$action_step_prov_name, $action_step["temp_army_id_num"]);
						
						//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($new_army, true)));
						
						$army_id_assigned = $new_army["army_id"];
						$army_id_temp = $action_step["temp_army_id_num"];
						$temp_id_map[$army_id_temp] = $army_id_assigned;
						
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::HandleMoveAction() successfully assigned temp army id: $army_id_temp with assigned army id: $army_id_assigned"));
						//self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($temp_id_map,true)));
					}
					else
					{
						self::notifyAllPlayers("debug", "", array('debugmessage' => "WARNING: unknown action_step_type in tryPayAction(): $action_step_type"));
					}
				}
				
				//the functionality here was formerly filled by ArmyStackMove on line 575
				//$this->game->ArmyStackMove($army_id, $provinces_JSON_stringified);
				//update the database with the final province location
				
				if(!$source_army)
				{
					self::notifyAllPlayers("debug", "", array('debugmessage' => "source_army is null with source_army_id:$source_army_id"));
					continue;
				}
				
				//sanity check: does this army want to move to a different province?
				if($dest_province_name != $source_army["prov_name"])
				{
					//first check if there is an existing player army here for us to merge into
					$main_army = $this->GetMainPlayerArmyInProvinceFromProvName($current_player_id, $dest_province_name);
					if($main_army == null)
					{
						//update the database with the army's new province
						$sql_update = "UPDATE armies SET province_id='$dest_province_name' WHERE army_id='$source_army_id';";
						self::DbQuery($sql_update);

						//update client UI
						self::notifyAllPlayers('playerArmyMove', '', array(
							'moving_player_id' => $current_player_id,
							'moving_player_name' => $current_player_name,
							'army_id_num' => $source_army_id,
							'pending_battles_update' => $this->GetPendingBattleProvincesAll(),
							'dest_province_id' => $dest_province_name
						));
						
					}
					else
					{
						$this->tryArmyStackTransfer($source_army_id, $main_army["army_id"]);
					}
					
					//record this move to help determine battle order later
					//unique value for move_id is automatically generated by the database
					//todo: i think this is unused?
					$current_turn = $this->getGameStateValue("playerturn_nbr");
					//$sql_insert = "INSERT INTO province_move_order (turn_id, province_name, player_id) VALUES ('$current_turn','$dest_province_name','$current_player_id');";
					//self::DbQuery($sql_insert);
				}
				else
				{
					self::notifyAllPlayers("debug", "", array('debugmessage' => "WARNING: army move ended at same province it started"));
				}
				
				//update the record
				if($cur_move_length > $longest_move_length)
				{
					$longest_move_length = $cur_move_length;
					$this->setStat($longest_move_length, "longest_move", $current_player_id);
				}
				
				//todo: handle any army splits here using the same steps as movement
				
				//send a message to the log
				$army_tiles_string = $this->GetUnitsInArmyString($source_army_id, $current_player_id);
				$dest_province_num = $this->getProvinceIdFromName($dest_province_name);
				$province_ui_name = $this->GetProvinceNameUIString($dest_province_num);
				self::notifyAllPlayers('showMessage', clienttranslate('${player_name} has moved ${army_tiles_string} to ${province_ui_name}'), array(
					'player_id' => $current_player_id,
					'player_name' => $current_player_name,
					'army_tiles_string' => $army_tiles_string,
					'province_ui_name' => $province_ui_name
				));
			}
			
			//do we need to update this?
			
			// process the tile payment
			$pips_spent = $this->DiscardTilesFromHand($paid_tile_infos, $current_player_id);
			$this->incStat($pips_spent, "pips_move", $current_player_id);
			
			//did this action trigger any new possible battles?
			//$attacking_player_id = $this->getGameStateValue("attacking_player_id");
			
			$outcome_info["failure_reason"] = self::ACTION_SUCCESS;
			
			//chaos horde may trigger a recalculation of capturable villages
			if($this->IsCurrentPlayerChaosHorde())
			{
				$this->ChaosHordeMoveUpdate();
			}
		}
		*/
		/*else
		{
			//todo: should there be a bgauserexception thrown here? 
			self::notifyPlayer($current_player_id, 'tileRefund', '', array(
				"refunded_tiles" => $paid_tile_infos,
				"location_from" => "paystack"
			));
			self::notifyAllPlayers('playerMoveFail', '', array(
				'moving_player_id' => $current_player_id,
				'moving_player_name' => $current_player_name,
				'army_id_num' => $source_army_id,
				'dest_province_id' => $dest_province_name
			));
		}*/
		
		return $outcome_info;
	}
	
	function ChaosHordeMoveUpdate()
	{
		$active_player_id = self::getActivePlayerId();
		self::notifyPlayer($active_player_id, 'chaosHordeMoveUpdate', '', array(
			'possible_capture_infos' => $this->GetPendingCaptureArmies($active_player_id),
			"buildable_provinces" => $this->GetPlayerBuildableProvinces($active_player_id)
		));
	}
}