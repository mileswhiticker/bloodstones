<?php

trait action_build
{
	function HandleBuildAction($action_info, $paid_tile_infos, $paid_tile_ids)
	{
		$c1 = count($action_info);
		$c2 = count($paid_tile_infos);
		$c3 = count($paid_tile_ids);
		//self::notifyAllPlayers("debug", "", array('debugmessage' => "server::HandleBuildAction(action_info($c1), paid_tile_infos($c2), paid_tile_ids($c3))"));
		//there is a rare bug somewhere in this function's call stack: getCards() card not found. i've only seen it pop up a couple of times and it goes away on a refresh
		//most recently it happened during chaos horde freebuild state
		
		$outcome_info = ["failure_reason" => self::ACTION_FAIL_UNKNOWN];
		$current_player_id = $this->getCurrentPlayerId();
		$current_player_name = $this->getCurrentPlayerName();
		
		//todo: check for active player status
		
		if($this->getStateName() != "playerMain" && $this->getStateName() != "freeBuild" && $this->getStateName() != "freeBuild_chaosHorde")
		{
			$outcome_info["failure_reason"] = self::ACTION_FAIL_STATE;
			return $outcome_info;
		}
		//todo: legality checks to prevent cheating
		//also todo: has the player paid enough lmao
		//for testing, assume it's legal
		//$success = true;
		
		//if($success)
		{
			//each province will have 1 new army
			$built_armies = [];
			$built_tile_names = [];
			foreach($action_info as $prov_name => $build_action_prov)
			{
				//note: new_tile_infos here needs to actually be new tile infos and not an array of tile ids
				//note: ajax only passes in an array of tile ids
				//for some reason $player_deck->getCards([]); doesnt work for the arrays that i pass in
				
				$tile_ids = $build_action_prov["tiles"];
				$player_deck = $this->player_decks[$current_player_id];
				//$player_hand = $player_deck->getCardsInLocation('hand', null, "card_id");
				$built_tile_infos = [];
				$built_tile_ids = [];
				
				$army_info = self::createArmy($prov_name, $current_player_id, $tile_ids, false);
				$built_tile_infos = $army_info["tiles"];
				/*$built_tile_infos = $player_deck->getCardsInLocation('army', $new_army["id_num"]);
				
				$army_info = [
					"army_id" => $new_army["id_num"],
					"province_id" => $prov_name,
					"player_id" => $current_player_id,
					"tiles" => $built_tile_infos,
				];*/
				
				$built_armies[$army_info["army_id"]] = $army_info;
				
				//now grab their info for the log
				foreach($built_tile_infos as $built_tile_id => $built_tile_info)
				{
					$built_tile_names[] = $this->getTileNameFromType($built_tile_info["type_arg"]);
				}
			}
			
			//eventually there should be checks here to see if the player has paid enough
			$statename = $this->getStateName();
			if($statename == "freeBuild" || $statename == "freeBuild_chaosHorde")
			{
				$freebuildpoints = self::getUniqueValueFromDB("SELECT player_freebuildpoints FROM player WHERE player_id='$current_player_id'");
				
				//wipe all freebuild points regardless of whether they used them or not
				self::DbQuery("UPDATE player SET player_freebuildpoints='0' WHERE player_id='$current_player_id'");
			}
			else
			{
				$pips_spent = $this->DiscardTilesFromHand($paid_tile_infos, $current_player_id);
				$this->incStat($pips_spent, "pips_move", $current_player_id);
				
				$this->updatePlayerHandChanged($current_player_id);
			}
			
			$units_built_string = "nothing";
			$tiles_built = count($built_tile_names);
			if($tiles_built > 0)
			{
				$units_built_string = implode(", ", $built_tile_names);
			}
			$this->incStat($tiles_built, "tiles_built", $current_player_id);
			self::notifyAllPlayers('playerBuildSuccess', clienttranslate('${player_name} builds ${units_built_string}'), 
				array(
					'units_built_string' => $units_built_string,
					'player_name' => $current_player_name,
					'player_id' => $current_player_id,
					'pending_battles_update' => $this->GetPendingBattleProvincesAll(),
					'built_armies' => $built_armies
				));
			
			//special handling for freebuild mode
			if($this->getStateName() == "freeBuild")
			{
				//this is a multiactiveplayer so we set this player nonactive, and go to the next state when they're the last one
				self::DbQuery("UPDATE player SET player_freebuildpoints=0 WHERE player_id='$current_player_id'");
				$this->gamestate->setPlayerNonMultiactive($current_player_id, "freeBuild_chaosHorde_setup");
			}
			else if($this->getStateName() == "freeBuild_chaosHorde")
			{
				//this is an activeplayer type state so we simply go to the next state
				self::DbQuery("UPDATE player SET player_freebuildpoints=0 WHERE player_id='$current_player_id'");
				$this->gamestate->nextState('freeBuild_finish');
			}
			else
			{
				//the only other state this should be called is "playerMain"
				//after completing a build action we stay in the same state and the current_player remains active
			}
			
			$outcome_info["failure_reason"] = self::ACTION_SUCCESS;
		}
		/*else
		{
			//todo: should there be a bgauserexception thrown here?
			self::notifyPlayer($current_player_id, 'tileRefund', '', array(
				"refunded_tiles" => $paid_tile_infos,
				"location_from" => "paystack"
			));
			self::notifyAllPlayers('playerBuildFail', '', array(
				'fail_player_id' => $current_player_id,
				'fail_player_name' => $current_player_name
			));
		}*/
		return $outcome_info;
	}
}