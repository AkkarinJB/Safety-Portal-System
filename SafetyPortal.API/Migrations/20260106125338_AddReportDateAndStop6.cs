using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SafetyPortal.API.Migrations
{
    public partial class AddReportDateAndStop6 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReportDate",
                table: "SafetyReports",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            
            migrationBuilder.AddColumn<int>(
                name: "Stop6",
                table: "SafetyReports",
                type: "int",
                nullable: false,
                defaultValue: 6);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReportDate",
                table: "SafetyReports");

            migrationBuilder.DropColumn(
                name: "Stop6",
                table: "SafetyReports");
        }
    }
}
