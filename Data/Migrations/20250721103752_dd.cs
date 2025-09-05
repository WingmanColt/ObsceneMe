using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class dd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StoryPages_Product_ProductId",
                table: "StoryPages");

            migrationBuilder.DropIndex(
                name: "IX_StoryPages_ProductId",
                table: "StoryPages");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_StoryPages_ProductId",
                table: "StoryPages",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_StoryPages_Product_ProductId",
                table: "StoryPages",
                column: "ProductId",
                principalTable: "Product",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
