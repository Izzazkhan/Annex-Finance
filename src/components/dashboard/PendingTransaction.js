import React, {useEffect, useState} from "react";
import moment from 'moment';
import Loading from "../UI/Loading";
import DataTable from "../common/DataTable";
import {connectAccount} from "../../core";


function PendingTransaction({ settings }) {
	const [curTime, setCurTime] = useState('');
	useEffect(() => {
		const dateTime = new Date();
		setCurTime(moment(dateTime).format('LLL'));
	}, []);


	console.log(curTime);

	const baseColumns = [
		{
			Header: 'Transactions',
			columns: [
				{
					Header: 'Type',
					accessor: 'type',
				},
				{
					Header: 'Amount',
					accessor: 'amount',
				},
				{
					Header: 'Asset',
					accessor: 'asset',
				},
				{
					Header: 'Current Date',
					accessor: 'date',
				},
			],
		},
	];

	const pendingData = React.useMemo(() => {
		return {
			type: (
				<div
					className="h-13 font-bold flex items-center space-x-2
					cursor-pointer w-full justify-start px-8 py-3"
				>
					<Loading size={'18px'} margin={'8px'} className={'text-white'}/>
					<div className="">
						{settings.pendingInfo.type}
					</div>
				</div>
			),
			amount: (
				<div
					className="h-13 font-bold flex items-center space-x-2
					cursor-pointer w-ful justify-end px-8 py-3"
				>
					{settings.pendingInfo && settings.pendingInfo.amount}
				</div>
			),
			asset: (
				<div
					className="h-13 font-bold flex items-center space-x-2
					cursor-pointer w-full justify-end px-8 py-3"
				>

					{settings.pendingInfo && settings.pendingInfo.symbol}
				</div>
			),
			date: (
				<div
					className="h-13 font-bold opacity-90 flex items-center space-x-2
					cursor-pointer w-full justify-end px-8 py-3"
				>

					{curTime}
				</div>
			)
		}
	}, [settings.pendingInfo, curTime]);

	return (
		<DataTable
			title="Pending Transactions"
			columns={baseColumns}
			data={[pendingData]}
		/>
	)
}

const mapStateToProps = ({ account }) => ({
	settings: account.setting
});

export default connectAccount(mapStateToProps, undefined)(
	PendingTransaction
);
