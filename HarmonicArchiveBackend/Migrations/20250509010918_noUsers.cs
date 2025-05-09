using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HarmonicArchiveBackend.Migrations
{
    /// <inheritdoc />
    public partial class noUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MusicSheets_Users_UserId",
                table: "MusicSheets");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "MusicSheets",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_MusicSheets_Users_UserId",
                table: "MusicSheets",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MusicSheets_Users_UserId",
                table: "MusicSheets");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "MusicSheets",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MusicSheets_Users_UserId",
                table: "MusicSheets",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
